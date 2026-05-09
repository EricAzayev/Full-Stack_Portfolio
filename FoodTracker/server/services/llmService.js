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

IMPORTANT: Provide SINGLE numeric values only (e.g., "150" not "100-200"). If uncertain, use the typical/average amount.

Output ONLY the following format with pipe-separated values. No explanations or additional text:

foodName:${name}|category:${category}|servingSize_g:${servingSize}|calories:${calories}|containsProbiotics:false|Protein_g:[estimate]|Carbohydrates_g:[estimate]|Fats_g:[estimate]|Omega3_DHA_EPA_mg:[estimate]|Vitamin_B12_mcg:[estimate]|Choline_mg:[estimate]|Magnesium_mg:[estimate]|Iron_mg:[estimate]|Zinc_mg:[estimate]|Calcium_mg:[estimate]|Vitamin_D_mcg:[estimate]|Vitamin_C_mg:[estimate]|Fiber_g:[estimate]|Collagen_g:[estimate]|Added_Sugars_g:[estimate]|Sodium_mg:[estimate]|Saturated_Fat_g:[estimate]|Monounsaturated_Fat_g:[estimate]

Replace [estimate] with SINGLE numerical values (not ranges) based on nutritional science. Be thorough and realistic.`;
};

/**
 * Parse a value that might be a range (e.g., "100-200") and return the average
 * @param {string} value The value to parse
 * @returns {number} The parsed number or average of range
 */
const parseNumericValue = (value) => {
  if (!value || value === '') return 0;
  
  const strValue = String(value).trim();
  
  // Check if it's a range (e.g., "100-200")
  if (strValue.includes('-')) {
    const parts = strValue.split('-').map(p => parseFloat(p.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      // Return the average of the range
      return (parts[0] + parts[1]) / 2;
    }
  }
  
  // Otherwise parse as regular number
  const parsed = parseFloat(strValue);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Parse LLM response to extract structured data
 */
const parseLLMResponse = (response) => {
  try {
    // Clean the response - remove any extra whitespace and newlines
    let cleanResponse = response.trim().replace(/\n/g, "");

    // Handle case where LLM omits "foodName:" prefix
    // If response doesn't start with "foodName:", prepend it
    if (!cleanResponse.startsWith("foodName:")) {
      // Extract the food name (everything before first |)
      const firstPipeIndex = cleanResponse.indexOf("|");
      if (firstPipeIndex > 0) {
        const foodNameValue = cleanResponse.substring(0, firstPipeIndex);
        cleanResponse = `foodName:${foodNameValue}` + cleanResponse.substring(firstPipeIndex);
      }
    }

    // Parse the pipe-separated values
    const pairs = cleanResponse.split("|");
    const parsedData = {};

    pairs.forEach((pair) => {
      const colonIndex = pair.indexOf(":");
      if (colonIndex > 0) {
        const key = pair.substring(0, colonIndex).trim();
        const value = pair.substring(colonIndex + 1).trim();
        if (key) {
          parsedData[key] = value;
        }
      }
    });

    // Validate required fields (allow empty strings for now, just check existence)
    const requiredFields = ["foodName", "category", "servingSize_g", "calories"];
    for (const field of requiredFields) {
      if (parsedData[field] === undefined || parsedData[field] === null) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return {
      foodName: parsedData.foodName,
      category: parsedData.category,
      servingSize: parseNumericValue(parsedData.servingSize_g),
      calories: parseNumericValue(parsedData.calories),
      isProbiotic: parsedData.containsProbiotics === "true",
      nutrients: {
        Protein_g: parseNumericValue(parsedData.Protein_g),
        Carbohydrates_g: parseNumericValue(parsedData.Carbohydrates_g),
        Fats_g: parseNumericValue(parsedData.Fats_g),
        Omega3_DHA_EPA_mg: parseNumericValue(parsedData.Omega3_DHA_EPA_mg),
        Vitamin_B12_mcg: parseNumericValue(parsedData.Vitamin_B12_mcg),
        Choline_mg: parseNumericValue(parsedData.Choline_mg),
        Magnesium_mg: parseNumericValue(parsedData.Magnesium_mg),
        Iron_mg: parseNumericValue(parsedData.Iron_mg),
        Zinc_mg: parseNumericValue(parsedData.Zinc_mg),
        Calcium_mg: parseNumericValue(parsedData.Calcium_mg),
        Vitamin_D_mcg: parseNumericValue(parsedData.Vitamin_D_mcg),
        Vitamin_C_mg: parseNumericValue(parsedData.Vitamin_C_mg),
        Fiber_g: parseNumericValue(parsedData.Fiber_g),
        Collagen_g: parseNumericValue(parsedData.Collagen_g),
        Added_Sugars_g: parseNumericValue(parsedData.Added_Sugars_g),
        Sodium_mg: parseNumericValue(parsedData.Sodium_mg),
        Saturated_Fat_g: parseNumericValue(parsedData.Saturated_Fat_g),
        Monounsaturated_Fat_g: parseNumericValue(parsedData.Monounsaturated_Fat_g),
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
