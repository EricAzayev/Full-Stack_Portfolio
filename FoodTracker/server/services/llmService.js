/**
 * LLM Service - Handles local (Ollama) and remote LLM API calls
 * Supports configurable model selection and fallback mechanisms
 */

import { DynamicTool } from "@langchain/core/tools";

const DEFAULT_OLLAMA_URL = "http://localhost:11434";
const DEFAULT_MODEL = "mistral:latest"; // Default to Mistral 7B
const REQUEST_TIMEOUT = 120000; // 2 minutes for model processing
const WEB_SEARCH_ENABLED = process.env.LANGCHAIN_WEB_SEARCH !== "false";
const WEB_SEARCH_MAX_RESULTS = Number(process.env.LANGCHAIN_WEB_SEARCH_RESULTS || 5);

let duckDuckGoSearchTool;

const decodeHtmlEntities = (value) => value
  .replace(/&amp;/g, "&")
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/&#x2F;/g, "/")
  .replace(/&#x27;/g, "'")
  .replace(/&#x60;/g, "`")
  .replace(/&nbsp;/g, " ");

const stripHtml = (value) => decodeHtmlEntities(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());

const unwrapDuckDuckGoLink = (link) => {
  if (!link) {
    return "";
  }

  const normalizedLink = link.startsWith("//") ? `https:${link}` : link;

  try {
    const parsedUrl = new URL(normalizedLink);
    const redirectedUrl = parsedUrl.searchParams.get("uddg");
    return redirectedUrl ? decodeURIComponent(redirectedUrl) : parsedUrl.toString();
  } catch {
    return normalizedLink;
  }
};

const extractHtmlSearchResults = (html) => {
  const results = [];
  const anchorRegex = /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let anchorMatch;

  while ((anchorMatch = anchorRegex.exec(html)) && results.length < WEB_SEARCH_MAX_RESULTS) {
    const [fullMatch, href, titleHtml] = anchorMatch;
    const title = stripHtml(titleHtml);
    const link = unwrapDuckDuckGoLink(href);
    const snippetWindow = html.slice(anchorMatch.index + fullMatch.length, anchorMatch.index + fullMatch.length + 1500);
    const snippetMatch = snippetWindow.match(/<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>|<div[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    const snippet = stripHtml((snippetMatch && (snippetMatch[1] || snippetMatch[2])) || "");

    if (!title && !snippet) {
      continue;
    }

    results.push({ title: title || link || `Result ${results.length + 1}`, link, snippet });
  }

  return results;
};

const runDuckDuckGoHtmlSearch = async (query) => {
  const searchUrl = `https://html.duckduckgo.com/html/?${new URLSearchParams({ q: query }).toString()}`;
  const response = await fetch(searchUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!response.ok) {
    throw new Error(`Search request failed: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const results = extractHtmlSearchResults(html);

  if (results.length === 0) {
    throw new Error("DuckDuckGo HTML search returned no parsable results");
  }

  return results;
};

const getDuckDuckGoSearchTool = () => {
  if (!duckDuckGoSearchTool) {
    duckDuckGoSearchTool = new DynamicTool({
      name: "duckduckgo-html-search",
      description: "Searches DuckDuckGo HTML results for current web information.",
      func: async (input) => JSON.stringify(await runDuckDuckGoHtmlSearch(input)),
    });
  }

  return duckDuckGoSearchTool;
};

const normalizeSearchResult = (result, index) => {
  if (typeof result === "string") {
    return {
      title: `Result ${index + 1}`,
      snippet: result.trim(),
      link: "",
    };
  }

  if (!result || typeof result !== "object") {
    return null;
  }

  const title = result.title || result.name || `Result ${index + 1}`;
  const snippet = result.snippet || result.description || result.body || result.text || "";
  const link = result.link || result.url || result.href || "";

  if (!snippet && !link) {
    return null;
  }

  return { title, snippet, link };
};

const coerceSearchResults = (rawResults) => {
  let parsedResults = rawResults;

  if (typeof rawResults === "string") {
    try {
      parsedResults = JSON.parse(rawResults);
    } catch {
      parsedResults = rawResults
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean);
    }
  }

  if (Array.isArray(parsedResults)) {
    return parsedResults
      .map((result, index) => normalizeSearchResult(result, index))
      .filter(Boolean)
      .slice(0, WEB_SEARCH_MAX_RESULTS);
  }

  const normalizedResult = normalizeSearchResult(parsedResults, 0);
  return normalizedResult ? [normalizedResult] : [];
};

const buildWebSearchContext = async (query) => {
  if (!WEB_SEARCH_ENABLED) {
    return {
      enabled: false,
      query,
      sources: [],
      context: "",
      provider: "duckduckgo-langchain",
      error: "LangChain web search disabled by environment",
    };
  }

  try {
    console.log(`📍 [LLM] Running LangChain web search for: ${query}`);
    const rawResults = await getDuckDuckGoSearchTool().invoke(query);
    const sources = coerceSearchResults(rawResults);

    if (sources.length === 0) {
      return {
        enabled: false,
        query,
        sources: [],
        context: "",
        provider: "duckduckgo-langchain",
        error: "No web search results returned",
      };
    }

    const context = sources
      .map((source, index) => {
        const linkLine = source.link ? `\nURL: ${source.link}` : "";
        return `[${index + 1}] ${source.title}${linkLine}\n${source.snippet}`.trim();
      })
      .join("\n\n");

    console.log(`✅ [LLM] LangChain web search returned ${sources.length} results`);
    return {
      enabled: true,
      query,
      sources,
      context,
      provider: "duckduckgo-langchain",
    };
  } catch (error) {
    console.warn("⚠️ [LLM] LangChain web search failed:", error.message);
    return {
      enabled: false,
      query,
      sources: [],
      context: "",
      provider: "duckduckgo-langchain",
      error: error.message,
    };
  }
};

const buildFoodSearchQuery = (foodData) => {
  const { name = "", category = "", servingSize = "", calories = "" } = foodData;
  return [
    name,
    category,
    servingSize ? `${servingSize}g serving` : "",
    calories ? `${calories} calories` : "",
    "nutrition facts macros vitamins minerals typical serving",
  ]
    .filter(Boolean)
    .join(" ");
};

const buildRecommendationSearchQuery = (userData) => {
  return [
    "daily nutrient recommendations",
    `${userData.gender || "adult"}`,
    userData.age ? `age ${userData.age}` : "",
    userData.activityLevel ? `activity ${userData.activityLevel}` : "",
    `${userData.weight || ""} kg`,
    "protein carbohydrates fats omega-3 vitamin b12 choline magnesium iron zinc calcium vitamin d vitamin c fiber evidence-based RDA DRI",
  ]
    .filter(Boolean)
    .join(" ");
};

const buildResearchSection = (searchContext) => {
  if (!searchContext?.enabled || !searchContext.context) {
    return "";
  }

  return `Use the following current web research context when it helps. Prefer values that are consistent across multiple reputable sources, especially clinical, government, or university sources.\n\nWeb Research Context:\n${searchContext.context}\n\n`;
};

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
    useWebSearch = false,
  } = options;

  const searchContext = useWebSearch
    ? await buildWebSearchContext(buildFoodSearchQuery(foodData))
    : {
        enabled: false,
        query: "",
        sources: [],
        context: "",
        provider: "duckduckgo-langchain",
      };

  const prompt = buildFoodAnalysisPrompt(foodData, searchContext);

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
            search: searchContext,
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
const buildFoodAnalysisPrompt = (foodData, searchContext) => {
  const {
    name = "[Food Name]",
    servingSize = "[Serving Size]",
    calories = "[Calories]",
    category = "[Category]",
  } = foodData;

  return `You are a nutritional analysis expert. Analyze the following food and provide comprehensive nutritional information.

${buildResearchSection(searchContext)}

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

const buildRecommendationPrompt = (userData, searchContext) => `You are a certified nutritionist. Generate daily nutrient recommendations.

${buildResearchSection(searchContext)}

Profile:
- Age: ${userData.age} years
- Gender: ${userData.gender}
- Height: ${userData.height} cm
- Weight: ${userData.weight} kg
- Activity Level: ${userData.activityLevel}
- Calorie Goal: ${userData.calorieGoal} kcal

CRITICAL RULES:
1. Protein = ${userData.weight} kg × activity multiplier (sedentary:0.8, light:1.0, moderate:1.2, active:1.6, very active:2.0)
2. Use RDA/DRI style values for vitamins/minerals and adjust for the user profile when supported
3. MUST output SINGLE numbers only (example: "90" NOT "75-100" or "90 mg")
4. NO UNITS in output (no mg, mcg, g, IU)
5. NO RANGES (75-100 is FORBIDDEN - pick ONE number like 87)
6. ONE LINE ONLY, no explanations

Output EXACTLY this format:
Calories_kcal:[number]|Protein_g:[number]|Carbohydrates_g:[number]|Fats_g:[number]|Omega3_DHA_EPA_mg:[number]|Vitamin_B12_mcg:[number]|Choline_mg:[number]|Magnesium_mg:[number]|Iron_mg:[number]|Zinc_mg:[number]|Calcium_mg:[number]|Vitamin_D_mcg:[number]|Vitamin_C_mg:[number]|Fiber_g:[number]|Collagen_g:[number]

Example correct output:
Calories_kcal:2000|Protein_g:88|Carbohydrates_g:250|Fats_g:67|Omega3_DHA_EPA_mg:250|Vitamin_B12_mcg:2.4|Choline_mg:550|Magnesium_mg:400|Iron_mg:11|Zinc_mg:8|Calcium_mg:1000|Vitamin_D_mcg:15|Vitamin_C_mg:90|Fiber_g:30|Collagen_g:10

NOW OUTPUT FOR THIS PROFILE (single line, numbers only, no ranges, no units):`;

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

const parseRecommendationResponse = (response) => {
  const cleanResponse = response.trim().replace(/\n/g, "");
  const pairs = cleanResponse.split("|");
  const recommendations = {};

  pairs.forEach((pair) => {
    const colonIndex = pair.indexOf(":");
    if (colonIndex <= 0) {
      return;
    }

    const key = pair.substring(0, colonIndex).trim();
    const value = pair.substring(colonIndex + 1).trim();

    if (!key || value === undefined) {
      return;
    }

    let cleanValue = value.replace(/\s*(mg|mcg|g|IU|grams\/day)\.?$/i, "");

    if (cleanValue.includes("-")) {
      const parts = cleanValue.split("-").map((part) => parseFloat(part.trim()));
      if (parts.length === 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
        cleanValue = ((parts[0] + parts[1]) / 2).toString();
      }
    }

    const parsedValue = parseFloat(cleanValue);
    if (!Number.isNaN(parsedValue)) {
      recommendations[key] = parsedValue;
    }
  });

  const requiredFields = ["Calories_kcal", "Protein_g", "Carbohydrates_g", "Fats_g"];
  for (const field of requiredFields) {
    if (recommendations[field] === undefined || recommendations[field] === null) {
      throw new Error(`LLM response missing required field: ${field}`);
    }
  }

  return recommendations;
};

const generateRecommendationsWithLLM = async (userData, options = {}) => {
  const {
    ollamaUrl = DEFAULT_OLLAMA_URL,
    model = DEFAULT_MODEL,
    useWebSearch = false,
  } = options;

  const searchContext = useWebSearch
    ? await buildWebSearchContext(buildRecommendationSearchQuery(userData))
    : {
        enabled: false,
        query: "",
        sources: [],
        context: "",
        provider: "duckduckgo-langchain",
      };

  const prompt = buildRecommendationPrompt(userData, searchContext);
  const llmResult = await callOllama(prompt, model, ollamaUrl);

  if (!llmResult.success) {
    return {
      success: false,
      error: llmResult.error,
      source: llmResult.source || "ollama",
      search: searchContext,
    };
  }

  try {
    const recommendations = parseRecommendationResponse(llmResult.response);
    return {
      success: true,
      data: recommendations,
      rawResponse: llmResult.response,
      prompt,
      model,
      source: "ollama",
      search: searchContext,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      rawResponse: llmResult.response,
      prompt,
      model,
      source: "ollama",
      search: searchContext,
    };
  }
};

export {
  callOllama,
  checkOllamaAvailable,
  analyzeFoodWithLLM,
  buildWebSearchContext,
  generateRecommendationsWithLLM,
  buildFoodAnalysisPrompt,
  parseLLMResponse,
  parseRecommendationResponse,
  DEFAULT_OLLAMA_URL,
  DEFAULT_MODEL,
  WEB_SEARCH_ENABLED,
};
