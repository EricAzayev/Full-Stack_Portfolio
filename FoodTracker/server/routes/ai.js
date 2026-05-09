import express from "express";
import {
  analyzeFoodWithLLM,
  checkOllamaAvailable,
  DEFAULT_OLLAMA_URL,
  DEFAULT_MODEL,
} from "../services/llmService.js";

const router = express.Router();

console.log("📍 [AI Routes] AI router loading...");

/**
 * POST /api/ai/analyze-food
 * Analyze food using local or remote LLM
 * 
 * Body:
 * {
 *   foodData: { name, servingSize, calories, category },
 *   ollamaUrl?: string,
 *   model?: string,
 *   useLocal?: boolean
 * }
 */
router.post("/analyze-food", async (req, res) => {
  try {
    console.log("📍 [AI] Food analysis request received");
    console.log("📍 [AI] Request body:", JSON.stringify(req.body, null, 2));
    
    const { foodData, ollamaUrl, model, useLocal } = req.body;

    // Validate input
    if (!foodData) {
      console.warn("⚠️ [AI] Missing foodData");
      return res.status(400).json({
        success: false,
        error: "Missing foodData in request body",
      });
    }

    console.log(`📍 [AI] Analyzing food: ${foodData.name}`);

    // Perform analysis
    const result = await analyzeFoodWithLLM(foodData, {
      ollamaUrl: ollamaUrl || DEFAULT_OLLAMA_URL,
      model: model || DEFAULT_MODEL,
      useLocal: useLocal !== false,
    });

    if (result.success) {
      console.log("✅ [AI] Analysis successful");
      res.json(result);
    } else {
      console.error("❌ [AI] Analysis failed:", result.error);
      res.status(500).json({
        success: false,
        error: result.error,
        source: result.source,
      });
    }
  } catch (error) {
    console.error("❌ [AI] Unexpected error:", error.message);
    console.error("❌ [AI] Stack trace:", error.stack);
    res.status(500).json({
      success: false,
      error: `Server error: ${error.message}`,
    });
  }
});

/**
 * GET /api/ai/check-ollama
 * Check if Ollama is available and get available models
 */
router.get("/check-ollama", async (req, res) => {
  try {
    console.log("📍 [AI] Checking Ollama availability");
    
    const ollamaUrl = req.query.url || DEFAULT_OLLAMA_URL;
    const result = await checkOllamaAvailable(ollamaUrl);

    res.json(result);
  } catch (error) {
    console.error("❌ [AI] Error checking Ollama:", error);
    res.status(500).json({
      error: error.message,
    });
  }
});

/**
 * GET /api/ai/defaults
 * Get default LLM configuration
 */
router.get("/defaults", (req, res) => {
  console.log("📍 [AI] Returning default LLM configuration");
  
  res.json({
    ollamaUrl: DEFAULT_OLLAMA_URL,
    defaultModel: DEFAULT_MODEL,
    models: [
      {
        id: "phi:latest",
        name: "Phi-3 (3.8B)",
        description: "Ultra-lightweight, perfect for mobile/edge devices",
        size: "3.8B",
        recommendedFor: "mobile, older devices",
        downloadUrl: "https://ollama.ai/library/phi",
      },
      {
        id: "phi:14b",
        name: "Phi-3 (14B)",
        description: "Fast and capable, good balance of quality/speed",
        size: "14B",
        recommendedFor: "modern laptops, tablets",
        downloadUrl: "https://ollama.ai/library/phi",
      },
      {
        id: "mistral:latest",
        name: "Mistral 7B",
        description: "Good quality responses, reasonable speed",
        size: "7B",
        recommendedFor: "desktop, most devices",
        downloadUrl: "https://ollama.ai/library/mistral",
      },
      {
        id: "tinyllama:latest",
        name: "TinyLlama (1.1B)",
        description: "Minimal resource usage, very fast",
        size: "1.1B",
        recommendedFor: "very old devices, extreme constraints",
        downloadUrl: "https://ollama.ai/library/tinyllama",
      },
    ],
    setup: {
      ollama: {
        description: "Download and run Ollama from ollama.ai",
        steps: [
          "1. Visit https://ollama.ai",
          "2. Download Ollama for your platform",
          "3. Install and run (it starts a server at port 11434)",
          "4. Pull a model: ollama pull mistral",
          "5. FoodTracker will automatically detect it",
        ],
      },
    },
  });
});

/**
 * POST /api/ai/generate-recommendations
 * Generate personalized nutrient recommendations using LLM
 * 
 * Body:
 * {
 *   userData: { name, age, gender, height, weight, activityLevel, calorieGoal },
 *   ollamaUrl?: string,
 *   model?: string
 * }
 */
router.post("/generate-recommendations", async (req, res) => {
  try {
    console.log("📍 [AI] Recommendation generation request received");
    
    const { userData, ollamaUrl, model } = req.body;

    // Validate input
    if (!userData || !userData.age || !userData.gender || !userData.activityLevel) {
      console.warn("⚠️ [AI] Missing required userData fields");
      return res.status(400).json({
        success: false,
        error: "Missing required user data (age, gender, activityLevel)",
      });
    }

    console.log(`📍 [AI] Generating recommendations for ${userData.name || 'user'}`);

    // Build prompt for LLM
    const prompt = `You are a certified nutritionist. Generate daily nutrient recommendations.

Profile:
- Age: ${userData.age} years
- Gender: ${userData.gender}
- Height: ${userData.height} cm
- Weight: ${userData.weight} kg
- Activity Level: ${userData.activityLevel}
- Calorie Goal: ${userData.calorieGoal} kcal

CRITICAL RULES:
1. Protein = ${userData.weight} kg × activity multiplier (sedentary:0.8, light:1.0, moderate:1.2, active:1.6, very active:2.0)
2. Use RDA/DRI for vitamins/minerals
3. MUST output SINGLE numbers only (example: "90" NOT "75-100" or "90 mg")
4. NO UNITS in output (no mg, mcg, g, IU)
5. NO RANGES (75-100 is FORBIDDEN - pick ONE number like 87)
6. ONE LINE ONLY, no explanations

Output EXACTLY this format:
Calories_kcal:[number]|Protein_g:[number]|Carbohydrates_g:[number]|Fats_g:[number]|Omega3_DHA_EPA_mg:[number]|Vitamin_B12_mcg:[number]|Choline_mg:[number]|Magnesium_mg:[number]|Iron_mg:[number]|Zinc_mg:[number]|Calcium_mg:[number]|Vitamin_D_mcg:[number]|Vitamin_C_mg:[number]|Fiber_g:[number]|Collagen_g:[number]

Example correct output:
Calories_kcal:2000|Protein_g:88|Carbohydrates_g:250|Fats_g:67|Omega3_DHA_EPA_mg:250|Vitamin_B12_mcg:2.4|Choline_mg:550|Magnesium_mg:400|Iron_mg:11|Zinc_mg:8|Calcium_mg:1000|Vitamin_D_mcg:15|Vitamin_C_mg:90|Fiber_g:30|Collagen_g:10

NOW OUTPUT FOR THIS PROFILE (single line, numbers only, no ranges, no units):`;

    // Import callOllama dynamically
    const { callOllama } = await import("../services/llmService.js");
    
    // Use model from request, not DEFAULT_MODEL
    const selectedModel = model || DEFAULT_MODEL;
    const selectedUrl = ollamaUrl || DEFAULT_OLLAMA_URL;
    
    console.log(`📍 [AI] Using model: ${selectedModel} at ${selectedUrl}`);
    console.log(`📝 [AI] Prompt being sent to model:\n${prompt}`);
    
    // Call LLM
    const llmResult = await callOllama(
      prompt,
      selectedModel,
      selectedUrl
    );

    if (!llmResult.success) {
      console.error("❌ [AI] LLM call failed:", llmResult.error);
      return res.status(500).json({
        success: false,
        error: llmResult.error,
        source: "ollama",
      });
    }

    // Parse the response
    const cleanResponse = llmResult.response.trim().replace(/\n/g, "");
    const pairs = cleanResponse.split("|");
    const recommendations = {};

    pairs.forEach((pair) => {
      const [key, value] = pair.split(":");
      if (key && value !== undefined) {
        // Remove any units (mg, mcg, g, IU, etc.) from the value
        let cleanValue = value.trim().replace(/\s*(mg|mcg|g|IU|grams\/day)\.?$/i, '');
        
        // Handle ranges (e.g., "75-100", "275-300") - take the average
        if (cleanValue.includes('-')) {
          const parts = cleanValue.split('-').map(v => parseFloat(v.trim()));
          if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            cleanValue = ((parts[0] + parts[1]) / 2).toString();
            console.log(`🔄 [AI] Converted range "${value}" to average: ${cleanValue}`);
          }
        }
        
        const parsedValue = parseFloat(cleanValue);
        if (!isNaN(parsedValue)) {
          recommendations[key.trim()] = parsedValue;
        }
      }
    });

    // Validate we got the required fields
    const requiredFields = ["Calories_kcal", "Protein_g", "Carbohydrates_g", "Fats_g"];
    for (const field of requiredFields) {
      if (!recommendations[field]) {
        console.error("❌ [AI] Missing required field in LLM response:", field);
        return res.status(500).json({
          success: false,
          error: `LLM response missing required field: ${field}`,
        });
      }
    }

    console.log("✅ [AI] Recommendations generated successfully");
    console.log(`📦 [AI] Sending response with prompt included`);

    res.json({
      success: true,
      data: recommendations,
      rawResponse: llmResult.response,
      prompt: prompt,
      model: selectedModel,
      source: "ollama",
    });
  } catch (error) {
    console.error("❌ [AI] Unexpected error:", error.message);
    console.error("❌ [AI] Stack trace:", error.stack);
    res.status(500).json({
      success: false,
      error: `Server error: ${error.message}`,
    });
  }
});

console.log("✅ [AI Routes] AI router loaded");

export default router;
