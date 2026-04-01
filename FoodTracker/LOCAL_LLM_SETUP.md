# Local LLM Integration for FoodTracker

## Overview

FoodTracker now supports **local LLM (Large Language Model) integration** using **Ollama** for AI-powered food analysis. This allows you to:

- ✅ Analyze foods completely offline (privacy-first)
- ✅ Get instant nutritional analysis without external API calls
- ✅ Run on desktop, laptop, or mobile devices
- ✅ Choose models based on your device specifications
- ✅ No internet required after model download

## Architecture

### Backend
- **Service**: `server/services/llmService.js`
  - Handles Ollama API integration
  - Builds structured prompts for food analysis
  - Parses LLM responses into structured food data
  - Supports configurable model selection

- **Routes**: `server/routes/ai.js`
  - `POST /api/ai/analyze-food` - Analyze food with LLM
  - `GET /api/ai/check-ollama` - Check Ollama availability
  - `GET /api/ai/defaults` - Get default LLM configuration

### Frontend
- **FoodLibraryTab.jsx**
  - "🤖 Analyze with Local AI" button
  - Direct integration with backend LLM service
  - Automatic form population from LLM results

- **UserTab.jsx**
  - LLM settings panel
  - Ollama URL configuration
  - Model selection
  - Ollama status checker
  - Setup instructions

## Setup Guide

### Step 1: Install Ollama

1. Visit **https://ollama.ai**
2. Download Ollama for your operating system:
   - **Windows/Mac/Linux**
3. Install and run Ollama
   - It automatically starts a server on `http://localhost:11434`
   - No additional configuration needed

### Step 2: Pull a Model

Open a terminal and run one of these commands based on your device:

**For Modern Laptops/Desktops** (2GB+ VRAM):
```bash
ollama pull mistral
```

**For Tablets/Mid-range Devices** (1-2GB VRAM):
```bash
ollama pull phi
```

**For Older Devices/Mobile** (<1GB VRAM):
```bash
ollama pull tinyllama
```

### Step 3: Configure in FoodTracker

1. Open FoodTracker
2. Go to **User Settings** tab
3. Scroll to **LLM Settings** section
4. Click **"Check Ollama Status"** button
5. If available, you'll see your installed models

## Model Selection Guide

### Available Models

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| **Phi-3** | 3.8B | ⚡⚡⚡ | ⭐⭐⭐⭐ | Mobile, tablets, good balance |
| **Mistral 7B** | 7B | ⚡⚡ | ⭐⭐⭐⭐⭐ | Desktop, VMs, best quality |
| **TinyLlama** | 1.1B | ⚡⚡⚡⚡ | ⭐⭐⭐ | Very old devices, extreme constraints |

### Device Recommendations

**Desktop/Laptop** (4GB+ RAM):
- Primary: `mistral:latest` (best accuracy)
- Alternative: `phi:latest` (faster)

**Tablet** (2-4GB RAM):
- Primary: `phi:latest` (balanced)
- Alternative: `mistral:latest` (if you have patience)

**Mobile/Limited** (<2GB RAM):
- Primary: `phi:latest` (3.8B variant)
- Alternative: `tinyllama:latest` (very fast)

## Usage

### Auto-Analysis with Local AI

1. Open **Food Library** tab
2. Enter food name, serving size, and calories
3. Click **"🤖 Analyze with Local AI"** button
4. Wait for analysis (15-60 seconds depending on model/device)
5. Form automatically fills with nutrients
6. Click **"+ Add Food"** to save

### Manual Prompt-Based Analysis

Still available as fallback:
1. Click **"📋 Copy Prompt"**
2. Paste into any external LLM
3. Copy response
4. Paste into text field
5. Click **"🔄 Parse & Fill Form"**

## API Reference

### POST /api/ai/analyze-food

Analyzes food and returns structured nutritional data.

**Request Body:**
```json
{
  "foodData": {
    "name": "Greek Yogurt",
    "servingSize": "227",
    "calories": "150",
    "category": "Dairy"
  },
  "ollamaUrl": "http://localhost:11434",
  "model": "mistral:latest",
  "useLocal": true
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "foodName": "Greek Yogurt",
    "category": "Dairy",
    "servingSize": 227,
    "calories": 150,
    "isProbiotic": true,
    "nutrients": {
      "Protein_g": 20,
      "Carbohydrates_g": 9,
      ...
    }
  },
  "source": "ollama",
  "model": "mistral:latest"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "LLM analysis failed: Connection refused",
  "source": "ollama"
}
```

### GET /api/ai/check-ollama

Checks Ollama availability and lists installed models.

**Query Parameters:**
- `url` - Ollama URL (default: http://localhost:11434)

**Response:**
```json
{
  "available": true,
  "models": [
    {
      "name": "mistral:latest",
      "modified_at": "2024-01-15T10:30:00.000Z"
    },
    {
      "name": "phi:latest",
      "modified_at": "2024-01-15T10:45:00.000Z"
    }
  ]
}
```

### GET /api/ai/defaults

Retrieves default LLM configuration and setup instructions.

**Response:**
```json
{
  "ollamaUrl": "http://localhost:11434",
  "defaultModel": "mistral:latest",
  "models": [
    {
      "id": "phi:latest",
      "name": "Phi-3 (3.8B)",
      "description": "Ultra-lightweight, perfect for mobile/edge devices",
      ...
    }
  ],
  "setup": { ... }
}
```

## Troubleshooting

### "Ollama is not available"
- [ ] Ensure Ollama is installed and running
- [ ] Check that Ollama server is on `http://localhost:11434`
- [ ] Try restarting Ollama
- [ ] If using a different URL, update it in LLM Settings

### "No models available"
- [ ] Pull a model: `ollama pull mistral`
- [ ] List models: `ollama list`
- [ ] Wait for download to complete (can take 5-10+ minutes)

### Analysis takes too long (>2 minutes)
- [ ] Switch to a faster model (TinyLlama, Phi-3)
- [ ] Check device resources (close other apps)
- [ ] Ensure no other heavy processes running

### Low accuracy/strange results
- [ ] Switch to Mistral 7B (best quality)
- [ ] Ensure you have complete food information
- [ ] Try manual prompt analysis with external LLM

## Offline Capability

Once Ollama and models are installed:
- **Desktop**: Fully offline, no internet required
- **Mobile**: Depends on network connectivity for Ollama access
  - Some mobile Ollama clients available (experimental)
  - Can use reverse proxy over LAN

## Privacy & Security

✅ **All processing happens locally**
- Food data never sent to external servers
- No tracking or telemetry
- Complete user privacy
- Works completely offline

## Performance Notes

| Device | Model | Time per Analysis |
|--------|-------|------------------|
| Desktop (fast) | Mistral 7B | 20-40s |
| Desktop (mid) | Phi-3 | 10-20s |
| Laptop | TinyLlama | 5-15s |
| Tablet | Phi-3 | 30-60s |
| Older Device | TinyLlama | 60-120s |

Times vary based on:
- Device CPU/GPU
- Model size
- System load
- Ollama cache

## Future Enhancements

Potential future features:
- [ ] GPU acceleration (CUDA/Metal)
- [ ] Model fine-tuning for food domain
- [ ] Batch analysis
- [ ] iOS/Android native integration
- [ ] Additional model options
- [ ] Response caching

## Support

For issues with:
- **Ollama**: Visit https://github.com/ollama/ollama
- **FoodTracker LLM Integration**: Check application logs
- **Model performance**: Consult Ollama documentation

## References

- Ollama: https://ollama.ai
- Mistral: https://mistral.ai
- Phi: https://huggingface.co/microsoft/phi-3
- TinyLlama: https://github.com/jzhang38/TinyLlama
