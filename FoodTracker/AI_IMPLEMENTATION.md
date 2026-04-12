# AI Implementation Architecture - FoodTracker Ollama Integration

## Overview

This document explains how local LLM (Ollama) integration was implemented in FoodTracker. Use this as a reference for implementing similar AI features in other projects.

## Architecture Summary

```
User Interface (React)
    ↓
FoodLibraryTab.jsx (triggers analysis)
    ↓
ollamaDetection.js (checks if Ollama is available)
    ↓
Express Backend (server.js)
    ↓
llmService.js (calls Ollama API)
    ↓
Ollama (http://localhost:11434)
    ↓
LLM Response ← Parses structured data ← Returns to frontend
```

## Core Implementation Details

### 1. **Ollama Detection Service** (`client/services/ollamaDetection.js`)

**Purpose**: Smart detection of whether Ollama is running, with caching to avoid excessive checks.

**Key Function**:
```javascript
checkOllamaStatus(url, skipCache = false)
```

**Logic**:
1. If `skipCache=false` and cached result exists within 15 seconds, return cached result
2. Otherwise, make HTTP request to `{url}/api/tags` endpoint
3. Parse response and validate that `models` array exists and is non-empty
4. Cache successful result for 15 seconds
5. Return `{ available: true, models: [...] }` or `{ available: false, error: "..." }`

**Why this matters**: 
- Ollama port might respond but the service isn't fully loaded
- Detecting models list proves the service is actually running
- 15-second cache prevents flooding with checks while user is analyzing multiple foods

**For your video extension**:
- Call `checkOllamaStatus(http://localhost:11434, true)` when the "Block Videos" button is clicked
- No cache needed if each analysis is independent

---

### 2. **Backend LLM Service** (`server/services/llmService.js`)

**Purpose**: Abstract the Ollama API and structured data parsing logic.

**Key Functions**:

#### `callOllama(prompt, model, ollamaUrl, timeoutMs = 30000)`
- POSTs to `{ollamaUrl}/api/generate`
- Uses `AbortController` for timeout management (not `AbortSignal.timeout()` for compatibility)
- Catches specific error types: `ECONNREFUSED`, `ENOTFOUND`, timeout, network errors
- Returns `{ success: true, response: "..." }` or `{ success: false, error: "..." }`

#### `analyzeFoodWithLLM(foodData, model, ollamaUrl)`
- Builds structured prompt with pipe-separated format
- Calls `callOllama()` with timeout
- Parses response using `parseLLMResponse()`
- Returns `{ success: true, data: { ...nutrients } }` or error

#### `parseLLMResponse(response)`
- Extracts structured data from LLM output
- Looks for patterns like `name:Value|category:Value|...`
- Validates critical fields (calories, protein, carbs, fats)
- Returns parsed object or throws validation error

**Pattern for extraction**:
```
Food: {name}
Calories: {calories}
Protein: {protein}g
Carbs: {carbs}g
Fats: {fats}g
```

**For your video extension**:
- Instead of structured food parsing, you'd parse video recommendations
- Pattern might be: `video_id:XXX|title:YYY|channel:ZZZ|block:true|reason:...`

---

### 3. **API Routes** (`server/routes/ai.js`)

**Endpoints**:

#### `POST /api/ai/analyze-food`
**Payload**: `{ foodData: {...}, model: "mistral", ollamaUrl: "http://localhost:11434" }`
**Response**: `{ success: true, data: {...} }` or `{ success: false, error: "..." }`

#### `GET /api/ai/check-ollama`
**Response**: `{ available: true, models: ["mistral", "phi"], error: null }`

**For your extension**:
- `POST /api/ai/analyze-videos` - analyzes video HTML, returns block/keep decisions
- `GET /api/ai/check-ollama` - same detection

---

### 4. **Frontend Analysis Flow** (`client/components/FoodLibraryTab.jsx`)

**User clicks "Analyze with Local AI"**:

1. **Fresh Detection** (skip 15-second cache):
   ```javascript
   const freshStatus = await checkOllamaStatus(url, true);
   ```
   - Ensures Ollama is actually available right now, not just 15 seconds ago

2. **Extract Available Models**:
   ```javascript
   const configuredModelName = llmConfig.model.split(':')[0];
   const availableModels = freshStatus.models;
   ```

3. **Auto-Model Selection** (fallback logic):
   ```javascript
   const modelAvailable = availableModels.some(m => 
     m.includes(configuredModelName)
   );
   
   if (!modelAvailable && availableModels.length > 0) {
     modelToUse = availableModels[0]; // Use first available
     modelWasAutoSelected = true;
   }
   ```

4. **User Feedback**:
   ```javascript
   if (modelWasAutoSelected) {
     setMessage(`🤖 Using available model: ${modelToUse} (${availableModels.length} installed)`);
   }
   ```

5. **Call Backend**:
   ```javascript
   const response = await fetch('/api/ai/analyze-food', {
     method: 'POST',
     body: JSON.stringify({ foodData, model: modelToUse, ollamaUrl: url })
   });
   ```

6. **Error Handling**:
   - If 404: Model not found → Show modal with available models
   - If connection error: Show setup modal
   - If timeout: Suggest better model or manual entry

**For your extension**:
- User clicks "Analyze & Block" button
- Extract video HTML from page
- Send to backend or call Ollama directly
- Receive list of `{ videoId, decision: "block|keep", reason: "..." }`
- Apply blocking using DOM removal or CSS hiding

---

### 5. **Smart Modal** (`client/components/OllamaSetupModal.jsx`)

**Two Modes**:

**Mode 1: Setup (Ollama not running)**
- Shows download link for Ollama
- Device-specific model recommendations
- Platform-specific instructions (Windows/Mac/Linux)
- FAQ and troubleshooting

**Mode 2: Configuration (Ollama running, wrong model selected)**
- Lists all detected models with checkmarks
- "Use This Model" buttons for each
- Shows current selection
- No setup needed

**For your extension**:
- Mode 1: "Ollama not running" → Installation instructions
- Mode 2: "These videos will be blocked" → Review decisions, apply button

---

## Key Design Patterns

### Pattern 1: Fresh Detection Before Critical Operations
```javascript
// Don't trust cached detection when about to perform analysis
const status = await checkOllamaStatus(url, true); // true = skip cache
```

### Pattern 2: Specific Error Classification
```javascript
if (error.code === 'ECONNREFUSED') {
  // Ollama port not open → not running
} else if (error.code === 'ENOTFOUND') {
  // DNS resolution failed → check URL
} else if (error.name === 'AbortError') {
  // Request took too long → model too slow or hung
}
```

### Pattern 3: Auto-Selection with Fallback
```javascript
const preferred = config.model;
const detected = status.models;

const selected = detected.includes(preferred) 
  ? preferred 
  : detected[0]; // Fall back to first available
```

### Pattern 4: Structured Prompt Format
```
Your task: Analyze this food and extract data.

Food data: name:Apple|category:Fruit|...

Respond in this format:
Name: {extracted_name}
Calories: {extracted_calories}
```

---

## Error Handling Strategy

**Levels of errors**:

1. **Detection Failure** → Show setup modal
2. **Model Not Found (404)** → Show available models list
3. **Timeout** → Suggest faster model or manual entry
4. **Connection (ECONNREFUSED)** → "Ollama is not running"
5. **URL Issues (ENOTFOUND)** → "Check your Ollama URL"

**User-Facing Messages**:
- ✅ Success: Show what model was used and results
- ⚠️ Warning: Suggest next steps
- ❌ Error: Be specific about what went wrong

---

## Performance Considerations

### Caching Strategy
- **Detection**: 15-second cache (prevents spam checks)
- **Skip cache**: Only before actual analysis (ensures fresh state)
- **Response timeout**: 30 seconds for complete analysis

### Optimization Opportunities
- Cache analysis results by food name (avoid re-analyzing "chicken breast")
- Batch multiple foods in single request
- Use smaller models for simple tasks (speed)
- Use larger models only when accuracy critical

---

## Adapting for Your Video Extension

### Step 1: Change the prompt structure
```javascript
// Instead of food parsing, parse video recommendations
const prompt = `
Analyze these YouTube video recommendations and decide which to block.

Videos: 
${videos.map(v => `ID:${v.id}|Title:${v.title}|Channel:${v.channel}|Views:${v.views}`).join('\n')}

Block videos that match these criteria: [user's criteria]

Respond in format:
${videos.map(v => `${v.id}:BLOCK|reason:...`).join('\n')}
`;
```

### Step 2: Change the response parser
```javascript
function parseBlockingDecisions(response) {
  const lines = response.split('\n');
  return lines.map(line => {
    const [videoId, decision, reason] = line.split('|');
    return { videoId, block: decision === 'BLOCK', reason };
  });
}
```

### Step 3: Change the DOM manipulation
```javascript
// Instead of populating form, hide videos
decisions.forEach(decision => {
  if (decision.block) {
    const videoElement = document.querySelector(`[data-video-id="${decision.videoId}"]`);
    videoElement.style.display = 'none'; // or remove from DOM
  }
});
```

### Step 4: Call from content script
```javascript
// In your extension's content script
async function analyzeAndBlockVideos() {
  const videoHTML = document.querySelector('.video-recommendations-container').innerHTML;
  
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    body: JSON.stringify({
      model: 'mistral',
      prompt: buildPrompt(videoHTML)
    })
  });
  
  const { response: decision } = await response.json();
  const blocked = parseBlockingDecisions(decision);
  applyBlockingToDOM(blocked);
}
```

---

## Files Created in FoodTracker

- `server/services/llmService.js` (147 lines) - Core LLM logic
- `server/routes/ai.js` (74 lines) - API endpoints
- `client/services/ollamaDetection.js` (91 lines) - Detection with caching
- `client/components/OllamaSetupModal.jsx` (200+ lines) - Smart modal
- `client/style.css` (~200 new lines) - Modal and button styling
- `LOCAL_LLM_SETUP.md` - User documentation

## Testing Checklist

- [ ] Ollama running on localhost:11434
- [ ] Fresh detection works before analysis
- [ ] Model auto-selects when configured one unavailable
- [ ] Modal shows detected models
- [ ] Error messages are specific and helpful
- [ ] Timeout handling works (request aborts after 30s)
- [ ] Cache correctly resets when needed
- [ ] Parsing extracts accurate data
- [ ] Fallback to manual entry when LLM fails

