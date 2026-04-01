/**
 * Ollama Detection Service
 * Checks for Ollama availability and provides user guidance
 */

let cachedStatus = null;
let lastCheckTime = 0;
const CACHE_DURATION = 15000; // Cache for 15 seconds only

/**
 * Check Ollama availability with caching
 */
export const checkOllamaStatus = async (ollamaUrl = 'http://localhost:11434', skipCache = false) => {
  const now = Date.now();
  
  // Return cached result if fresh and cache not skipped
  if (!skipCache && cachedStatus && now - lastCheckTime < CACHE_DURATION) {
    console.log('📍 [Ollama Detection] Using cached status');
    return cachedStatus;
  }

  try {
    console.log('📍 [Ollama Detection] Checking Ollama availability...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Check if Ollama is responding
    const response = await fetch(`${ollamaUrl}/api/tags`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    // Make sure we got valid JSON with models array
    if (!data.models || !Array.isArray(data.models)) {
      throw new Error('Invalid Ollama response format');
    }

    // Only consider it available if we have at least some response structure
    if (data.models.length === 0) {
      throw new Error('No models installed in Ollama');
    }
    
    cachedStatus = {
      available: true,
      models: data.models || [],
      url: ollamaUrl,
      timestamp: now,
    };

    lastCheckTime = now;
    console.log('✅ [Ollama Detection] Ollama is available with', data.models.length, 'model(s)');
    return cachedStatus;
  } catch (error) {
    console.warn('⚠️ [Ollama Detection] Ollama not available:', error.message);
    
    cachedStatus = {
      available: false,
      models: [],
      url: ollamaUrl,
      error: error.message,
      timestamp: now,
    };

    lastCheckTime = now;
    return cachedStatus;
  }
};

/**
 * Get device-appropriate model recommendations
 */
export const getModelRecommendations = () => {
  // Estimate device capabilities (rough heuristic)
  const ram = navigator.deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 4;
  const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

  const recommendations = [];

  if (isMobile) {
    recommendations.push({
      id: 'phi:latest',
      name: 'Phi-3 (3.8B)',
      reason: 'Best for mobile - very fast, good quality',
      downloadSize: '2.3GB',
      ramRequired: '2-3GB',
      speed: 'Fast (~20-30s)',
    });
    recommendations.push({
      id: 'tinyllama:latest',
      name: 'TinyLlama (1.1B)',
      reason: 'Ultra-lightweight for older phones',
      downloadSize: '637MB',
      ramRequired: '1-2GB',
      speed: 'Very fast (~5-10s)',
    });
  } else if (ram <= 4) {
    recommendations.push({
      id: 'phi:latest',
      name: 'Phi-3 (3.8B)',
      reason: 'Good balance for your device',
      downloadSize: '2.3GB',
      ramRequired: '2-3GB',
      speed: 'Fast (~20-30s)',
    });
    recommendations.push({
      id: 'mistral:latest',
      name: 'Mistral 7B',
      reason: 'Better quality if you have patience',
      downloadSize: '4.1GB',
      ramRequired: '3-4GB',
      speed: 'Slower (~40-60s)',
    });
  } else {
    recommendations.push({
      id: 'mistral:latest',
      name: 'Mistral 7B',
      reason: 'Recommended - best quality',
      downloadSize: '4.1GB',
      ramRequired: '4GB+',
      speed: 'Medium (~30-40s)',
    });
    recommendations.push({
      id: 'phi:latest',
      name: 'Phi-3 (3.8B)',
      reason: 'Faster alternative',
      downloadSize: '2.3GB',
      ramRequired: '2-3GB',
      speed: 'Fast (~15-20s)',
    });
  }

  return {
    recommendations,
    deviceInfo: {
      estimatedRam: `${ram}GB`,
      cores: cores,
      isMobile,
    },
  };
};

/**
 * Get setup instructions for the user's platform
 */
export const getSetupInstructions = () => {
  const platform = navigator.platform.toLowerCase();
  let instructions = [];

  if (platform.includes('win')) {
    instructions = [
      '1. Visit https://ollama.ai',
      '2. Download "Ollama for Windows"',
      '3. Run the installer and follow prompts',
      '4. Ollama starts automatically',
      '5. Open Command Prompt and run: ollama pull mistral',
      '6. Come back here and try again!',
    ];
  } else if (platform.includes('mac')) {
    instructions = [
      '1. Visit https://ollama.ai',
      '2. Download "Ollama for macOS"',
      '3. Drag to Applications folder',
      '4. Open Applications > Ollama',
      '5. Open Terminal and run: ollama pull mistral',
      '6. Come back here and try again!',
    ];
  } else if (platform.includes('linux')) {
    instructions = [
      '1. Visit https://ollama.ai',
      '2. Download "Ollama for Linux"',
      '3. Run the installer',
      '4. Run: ollama pull mistral',
      '5. Ollama will start automatically',
      '6. Come back here and try again!',
    ];
  } else {
    instructions = [
      '1. Visit https://ollama.ai',
      '2. Download Ollama for your platform',
      '3. Install and run',
      '4. Pull a model: ollama pull mistral',
      '5. FoodTracker will detect it automatically',
    ];
  }

  return instructions;
};

/**
 * Clear cached status (useful for refresh button)
 */
export const clearCache = () => {
  cachedStatus = null;
  lastCheckTime = 0;
};
