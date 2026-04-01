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

console.log("✅ [AI Routes] AI router loaded");

export default router;
