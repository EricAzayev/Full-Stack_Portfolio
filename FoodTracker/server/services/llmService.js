/**
 * LLM Service - Handles local (Ollama) and remote LLM API calls
 * Supports configurable model selection and fallback mechanisms
 */

const DEFAULT_OLLAMA_URL = "http://localhost:11434";
const DEFAULT_MODEL = "mistral:latest"; // Default to Mistral 7B
const REQUEST_TIMEOUT = 120000; // 2 minutes for model processing

/**
 * Call local Ollama instance
 */
const callOllama = async (prompt, model = DEFAULT_MODEL, ollamaUrl = DEFAULT_OLLAMA_URL) => {
  try {
    console.log(`📍 [LLM] Calling Ollama at ${ollamaUrl} with model: ${model}`);
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false,
        temperature: 0.3, // Lower temperature for deterministic output
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.response) {
      throw new Error("No response from Ollama");
    }

    console.log("✅ [LLM] Ollama response received");
    return {
      success: true,
      response: data.response.trim(),
      model: model,
      source: "ollama",
    };
  } catch (error) {
    let errorMessage = error.message;
    
    // Detect specific error types
    if (error.name === 'AbortError') {
      errorMessage = `Request timeout (${REQUEST_TIMEOUT}ms) - Ollama took too long to respond`;
    } else if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
      errorMessage = 'Connection refused - Ollama is not running on ' + ollamaUrl;
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      errorMessage = 'Cannot reach ' + ollamaUrl + ' - check the Ollama URL is correct';
    } else if (error.message.includes('fetch') || error instanceof TypeError) {
      errorMessage = 'Network error - is Ollama running at ' + ollamaUrl + '?';
    }
    
    console.error("❌ [LLM] Ollama error:", errorMessage);
    return {
      success: false,
      error: errorMessage,
      source: "ollama",
    };
  }
};

/**
 * Check if Ollama is available
 */
const checkOllamaAvailable = async (ollamaUrl = DEFAULT_OLLAMA_URL) => {
  try {
    console.log("📍 [LLM] Checking if Ollama is available at:", ollamaUrl);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${ollamaUrl}/api/tags`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Ollama not responding correctly`);
    }

    const data = await response.json();
    console.log("✅ [LLM] Ollama is available");
    return {
      available: true,
      models: data.models || [],
    };
  } catch (error) {
    console.warn("⚠️ [LLM] Ollama not available:", error.message);
    return {
      available: false,
      models: [],
      error: error.message,
    };
  }
};

/**
 * Analyze food using LLM with structured output parsing
 */
const analyzeFoodWithLLM = async (foodData, options = {}) => {
  const {
    ollamaUrl = DEFAULT_OLLAMA_URL,
    model = DEFAULT_MODEL,
    useLocal = true,
  } = options;

  // Build the analysis prompt
  const prompt = buildFoodAnalysisPrompt(foodData);

  try {
    // Try local Ollama first if enabled
    if (useLocal) {
      console.log("📍 [LLM] Attempting local LLM analysis...");
      const ollamaResult = await callOllama(prompt, model, ollamaUrl);
      
      if (ollamaResult.success) {
        try {
          // Parse the structured response
          const parsed = parseLLMResponse(ollamaResult.response);
          console.log("✅ [LLM] Response parsed successfully");
          return {
            success: true,
            data: parsed,
            rawResponse: ollamaResult.response,
            source: "ollama",
            model: model,
          };
        } catch (parseError) {
          console.error("❌ [LLM] Failed to parse response:", parseError.message);
          console.error("❌ [LLM] Raw response was:", ollamaResult.response);
          throw new Error(`Failed to parse LLM response: ${parseError.message}`);
        }
      } else {
        console.warn("⚠️ [LLM] Local analysis failed, error details:", ollamaResult.error);
        throw new Error(`Ollama error: ${ollamaResult.error}`);
      }
    }

    // Fallback: return error if local fails
    return {
      success: false,
      error: `LLM analysis failed: Unknown error`,
      source: "none",
    };
  } catch (error) {
    console.error("❌ [LLM] Unexpected error during analysis:", error.message);
    console.error("❌ [LLM] Stack:", error.stack);
    return {
      success: false,
      error: error.message,
      source: "none",
    };
  }
};

/**
 * Build the prompt for food analysis
 */
const buildFoodAnalysisPrompt = (foodData) => {
  const {
    name = "[Food Name]",
    servingSize = "[Serving Size]",
    calories = "[Calories]",
    category = "[Category]",
  } = foodData;

  return `You are a nutritional analysis expert. Analyze the following food and provide comprehensive nutritional information.

Food Details:
- Name: ${name}
- Serving Size: ${servingSize}g
- Calories: ${calories}
- Category: ${category}

These values may be incomplete. Use your knowledge to make reasonable, evidence-based estimates for typical servings.

Output ONLY the following format with pipe-separated values. No explanations or additional text:

foodName:${name}|category:${category}|servingSize_g:${servingSize}|calories:${calories}|containsProbiotics:false|Protein_g:[estimate]|Carbohydrates_g:[estimate]|Fats_g:[estimate]|Omega3_DHA_EPA_mg:[estimate]|Vitamin_B12_mcg:[estimate]|Choline_mg:[estimate]|Magnesium_mg:[estimate]|Iron_mg:[estimate]|Zinc_mg:[estimate]|Calcium_mg:[estimate]|Vitamin_D_mcg:[estimate]|Vitamin_C_mg:[estimate]|Fiber_g:[estimate]|Collagen_g:[estimate]

Replace [estimate] with numerical values based on nutritional science. Be thorough and realistic.`;
};

/**
 * Parse LLM response to extract structured data
 */
const parseLLMResponse = (response) => {
  try {
    // Clean the response - remove any extra whitespace and newlines
    const cleanResponse = response.trim().replace(/\n/g, "");

    // Parse the pipe-separated values
    const pairs = cleanResponse.split("|");
    const parsedData = {};

    pairs.forEach((pair) => {
      const [key, value] = pair.split(":");
      if (key && value !== undefined) {
        parsedData[key.trim()] = value.trim();
      }
    });

    // Validate required fields
    const requiredFields = ["foodName", "category", "servingSize_g", "calories"];
    for (const field of requiredFields) {
      if (!parsedData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return {
      foodName: parsedData.foodName,
      category: parsedData.category,
      servingSize: parseFloat(parsedData.servingSize_g) || 0,
      calories: parseFloat(parsedData.calories) || 0,
      isProbiotic: parsedData.containsProbiotics === "true",
      nutrients: {
        Protein_g: parseFloat(parsedData.Protein_g) || 0,
        Carbohydrates_g: parseFloat(parsedData.Carbohydrates_g) || 0,
        Fats_g: parseFloat(parsedData.Fats_g) || 0,
        Omega3_DHA_EPA_mg: parseFloat(parsedData.Omega3_DHA_EPA_mg) || 0,
        Vitamin_B12_mcg: parseFloat(parsedData.Vitamin_B12_mcg) || 0,
        Choline_mg: parseFloat(parsedData.Choline_mg) || 0,
        Magnesium_mg: parseFloat(parsedData.Magnesium_mg) || 0,
        Iron_mg: parseFloat(parsedData.Iron_mg) || 0,
        Zinc_mg: parseFloat(parsedData.Zinc_mg) || 0,
        Calcium_mg: parseFloat(parsedData.Calcium_mg) || 0,
        Vitamin_D_mcg: parseFloat(parsedData.Vitamin_D_mcg) || 0,
        Vitamin_C_mg: parseFloat(parsedData.Vitamin_C_mg) || 0,
        Fiber_g: parseFloat(parsedData.Fiber_g) || 0,
        Collagen_g: parseFloat(parsedData.Collagen_g) || 0,
      },
    };
  } catch (error) {
    console.error("❌ [LLM] Parse error:", error.message);
    throw new Error(`Failed to parse LLM response: ${error.message}`);
  }
};

export {
  callOllama,
  checkOllamaAvailable,
  analyzeFoodWithLLM,
  buildFoodAnalysisPrompt,
  parseLLMResponse,
  DEFAULT_OLLAMA_URL,
  DEFAULT_MODEL,
};
