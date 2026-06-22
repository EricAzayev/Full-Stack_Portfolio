import React, { useState, useEffect } from 'react';
import OllamaSetupModal from './OllamaSetupModal';
import { checkOllamaStatus, clearCache } from '../services/ollamaDetection';
import { apiUrl } from '../services/api';

const FoodLibraryTab = () => {
  const [foodLibrary, setFoodLibrary] = useState({});
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [newFood, setNewFood] = useState({
    name: '',
    category: '',
    servingSize: '',
    calories: '',
    isProbiotic: false,
    nutrients: {
      Protein_g: '',
      Carbohydrates_g: '',
      Fats_g: '',
      Omega3_DHA_EPA_mg: '',
      Vitamin_B12_mcg: '',
      Choline_mg: '',
      Magnesium_mg: '',
      Iron_mg: '',
      Zinc_mg: '',
      Calcium_mg: '',
      Vitamin_D_mcg: '',
      Vitamin_C_mg: '',
      Fiber_g: '',
      Collagen_g: '',
      Added_Sugars_g: '',
      Sodium_mg: '',
      Saturated_Fat_g: '',
      Monounsaturated_Fat_g: ''
    }
  });
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [editingFood, setEditingFood] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [aiResult, setAiResult] = useState('');
  const [showAiTools, setShowAiTools] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [llmConfig, setLlmConfig] = useState({
    ollamaUrl: 'http://localhost:11434',
    model: 'mistral:latest',
  });
  const [ollamaStatus, setOllamaStatus] = useState(null);
  const [showSetupModal, setShowSetupModal] = useState(false);

  const fetchFoodLibrary = async () => {
    try {
      const response = await fetch(apiUrl('/api/foodLibrary'));
      const data = await response.json();
      setFoodLibrary(data);
    } catch (error) {
      console.error('Error fetching food library:', error);
      setMessage('Failed to load food library');
    }
  };

  // Fetch food library data
  useEffect(() => {
    const checkOllama = async () => {
      const status = await checkOllamaStatus(llmConfig.ollamaUrl);
      setOllamaStatus(status);
      
      // Auto-select first available model if current model isn't available
      if (status?.available && status.models && status.models.length > 0) {
        const modelNames = status.models.map(m => typeof m === 'string' ? m : m.name);
        if (!modelNames.includes(llmConfig.model)) {
          const firstModel = modelNames[0];
          console.log(`📍 Model "${llmConfig.model}" not found, using "${firstModel}"`);
          setLlmConfig(prev => ({ ...prev, model: firstModel }));
        }
      }
    };

    fetchFoodLibrary();
    checkOllama();
  }, []);

  useEffect(() => {
    const handleUserDataImported = () => {
      fetchFoodLibrary();
    };

    window.addEventListener('foodtracker:user-data-imported', handleUserDataImported);

    return () => {
      window.removeEventListener('foodtracker:user-data-imported', handleUserDataImported);
    };
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('nutrients.')) {
      const nutrientName = name.split('.')[1];
      setNewFood(prev => ({
        ...prev,
        nutrients: {
          ...prev.nutrients,
          [nutrientName]: value
        }
      }));
    } else {
      setNewFood(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!newFood.name.trim()) {
      newErrors.name = 'Food name is required';
    }

    if (!newFood.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!newFood.servingSize || newFood.servingSize <= 0) {
      newErrors.servingSize = 'Serving size must be greater than 0';
    }

    if (!newFood.calories || newFood.calories < 0) {
      newErrors.calories = 'Calories must be 0 or greater';
    }

    // Validate nutrients (all should be numbers >= 0)
    Object.entries(newFood.nutrients).forEach(([nutrient, value]) => {
      if (value !== '' && (isNaN(value) || parseFloat(value) < 0)) {
        newErrors[`nutrients.${nutrient}`] = 'Must be a number >= 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage('Please fix the errors below');
      return;
    }

    try {
      // Convert nutrient values to numbers
      const processedNutrients = {};
      Object.entries(newFood.nutrients).forEach(([nutrient, value]) => {
        processedNutrients[nutrient] = value === '' ? 0 : parseFloat(value);
      });

      const foodData = {
        name: newFood.name.trim(),
        category: newFood.category.trim(),
        servingSize: parseFloat(newFood.servingSize),
        calories: parseFloat(newFood.calories),
        isProbiotic: newFood.isProbiotic,
        nutrients: processedNutrients
      };

      const url = editingFood 
        ? apiUrl(`/api/foodLibrary/${encodeURIComponent(editingFood)}`)
        : apiUrl('/api/foodLibrary');
      
      const method = editingFood ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(foodData)
      });

      if (response.ok) {
        const result = await response.json();
        setFoodLibrary(result.foodLibrary);
        setMessage(editingFood ? `✓ Food "${newFood.name}" updated successfully!` : '✓ Food added successfully!');
        setIsAddingFood(false);
        setEditingFood(null);
        setNewFood({
          name: '',
          category: '',
          servingSize: '',
          calories: '',
          isProbiotic: false,
          nutrients: {
            Protein_g: '',
            Carbohydrates_g: '',
            Fats_g: '',
            Omega3_DHA_EPA_mg: '',
            Vitamin_B12_mcg: '',
            Choline_mg: '',
            Magnesium_mg: '',
            Iron_mg: '',
            Zinc_mg: '',
            Calcium_mg: '',
            Vitamin_D_mcg: '',
            Vitamin_C_mg: '',
            Fiber_g: '',
            Collagen_g: '',
            Added_Sugars_g: '',
            Sodium_mg: '',
            Saturated_Fat_g: '',
            Monounsaturated_Fat_g: ''
          }
        });
        setErrors({});
        
        // Clear success message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error adding food:', error);
      setMessage('Error adding food. Please try again.');
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setIsAddingFood(false);
    setEditingFood(null);
    setNewFood({
      name: '',
      category: '',
      servingSize: '',
      calories: '',
      isProbiotic: false,
      nutrients: {
        Protein_g: '',
        Carbohydrates_g: '',
        Fats_g: '',
        Omega3_DHA_EPA_mg: '',
        Vitamin_B12_mcg: '',
        Choline_mg: '',
        Magnesium_mg: '',
        Iron_mg: '',
        Zinc_mg: '',
        Calcium_mg: '',
        Vitamin_D_mcg: '',
        Vitamin_C_mg: '',
        Fiber_g: '',
        Collagen_g: '',
        Added_Sugars_g: '',
        Sodium_mg: '',
        Saturated_Fat_g: '',
        Monounsaturated_Fat_g: ''
      }
    });
    setErrors({});
    setMessage('');
  };

  // Handle edit food
  const handleEditFood = (foodName, foodData) => {
    setEditingFood(foodName);
    setNewFood({
      name: foodName,
      category: foodData.Metadata.Category,
      servingSize: foodData.Metadata.ServingSize_g.toString(),
      calories: foodData.Metadata.Calories_kcal.toString(),
      isProbiotic: foodData.Metadata.IsProbiotic,
      nutrients: {
        Protein_g: foodData.Nutrients.Protein_g.toString(),
        Carbohydrates_g: foodData.Nutrients.Carbohydrates_g.toString(),
        Fats_g: foodData.Nutrients.Fats_g.toString(),
        Omega3_DHA_EPA_mg: foodData.Nutrients.Omega3_DHA_EPA_mg.toString(),
        Vitamin_B12_mcg: foodData.Nutrients.Vitamin_B12_mcg.toString(),
        Choline_mg: foodData.Nutrients.Choline_mg.toString(),
        Magnesium_mg: foodData.Nutrients.Magnesium_mg.toString(),
        Iron_mg: foodData.Nutrients.Iron_mg.toString(),
        Zinc_mg: foodData.Nutrients.Zinc_mg.toString(),
        Calcium_mg: foodData.Nutrients.Calcium_mg.toString(),
        Vitamin_D_mcg: foodData.Nutrients.Vitamin_D_mcg.toString(),
        Vitamin_C_mg: foodData.Nutrients.Vitamin_C_mg.toString(),
        Fiber_g: foodData.Nutrients.Fiber_g.toString(),
        Collagen_g: foodData.Nutrients.Collagen_g.toString(),
        Added_Sugars_g: foodData.Nutrients.Added_Sugars_g.toString(),
        Sodium_mg: foodData.Nutrients.Sodium_mg.toString(),
        Saturated_Fat_g: foodData.Nutrients.Saturated_Fat_g.toString(),
        Monounsaturated_Fat_g: foodData.Nutrients.Monounsaturated_Fat_g.toString()
      }
    });
    setIsAddingFood(true);
  };

  // Handle delete food
  const handleDeleteFood = async (foodName) => {
    try {
      const response = await fetch(apiUrl(`/api/foodLibrary/${encodeURIComponent(foodName)}`), {
        method: 'DELETE'
      });

      if (response.ok) {
        const result = await response.json();
        setFoodLibrary(result.foodLibrary);
        setMessage(`✓ Food "${foodName}" deleted successfully!`);
        setShowDeleteConfirm(null);
        
        // Clear success message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting food:', error);
      setMessage('Error deleting food. Please try again.');
    }
  };

  // Copy prompt to clipboard
  const copyPromptToClipboard = async () => {
    const promptText = `FoodName: ${newFood.name || '[Food Name]'}, servingSize: ${newFood.servingSize || '[Serving Size]'}, calories: ${newFood.calories || '[Calories]'}.

These values may be null, at which point you should make a reasonable, evidence-based estimate for a typical serving. Output only the formatted line, with no explanations or additional text.

Write a dissectable line formatted as follows:

foodName:${newFood.name || '[name]'}|category:${newFood.category || '[category]'}|servingSize_g:${newFood.servingSize || '[servingSize]'}|calories:${newFood.calories || '[calories]'}|containsProbiotics:${newFood.isProbiotic}|Protein_g:${newFood.nutrients.Protein_g || '[val]'}|Carbohydrates_g:${newFood.nutrients.Carbohydrates_g || '[val]'}|Fats_g:${newFood.nutrients.Fats_g || '[val]'}|Omega3_DHA_EPA_mg:${newFood.nutrients.Omega3_DHA_EPA_mg || '[val]'}|Vitamin_B12_mcg:${newFood.nutrients.Vitamin_B12_mcg || '[val]'}|Choline_mg:${newFood.nutrients.Choline_mg || '[val]'}|Magnesium_mg:${newFood.nutrients.Magnesium_mg || '[val]'}|Iron_mg:${newFood.nutrients.Iron_mg || '[val]'}|Zinc_mg:${newFood.nutrients.Zinc_mg || '[val]'}|Calcium_mg:${newFood.nutrients.Calcium_mg || '[val]'}|Vitamin_D_mcg:${newFood.nutrients.Vitamin_D_mcg || '[val]'}|Vitamin_C_mg:${newFood.nutrients.Vitamin_C_mg || '[val]'}|Fiber_g:${newFood.nutrients.Fiber_g || '[val]'}|Collagen_g:${newFood.nutrients.Collagen_g || '[val]'}|Added_Sugars_g:${newFood.nutrients.Added_Sugars_g || '[val]'}|Sodium_mg:${newFood.nutrients.Sodium_mg || '[val]'}|Saturated_Fat_g:${newFood.nutrients.Saturated_Fat_g || '[val]'}|Monounsaturated_Fat_g:${newFood.nutrients.Monounsaturated_Fat_g || '[val]'}

A food tracker will dissect the line to fill in the user's nutrition library, so be as thorough and realistic as possible with all nutrient values. Use your best nutritional knowledge to estimate missing information when data is incomplete.`;

    try {
      await navigator.clipboard.writeText(promptText);
      setMessage('✓ Prompt copied to clipboard!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      setMessage('Failed to copy to clipboard. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Parse AI result and fill form
  const parseAiResult = () => {
    try {
      // Helper to parse numeric values including ranges
      const parseNumericValue = (value) => {
        if (!value || value === '') return '';
        const strValue = String(value).trim();
        
        // Check if it's a range (e.g., "100-200")
        if (strValue.includes('-')) {
          const parts = strValue.split('-').map(p => parseFloat(p.trim()));
          if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            // Return the average of the range
            return ((parts[0] + parts[1]) / 2).toString();
          }
        }
        
        // Otherwise return as-is
        return strValue;
      };
      
      // Clean the input - remove any extra whitespace and newlines
      const cleanResult = aiResult.trim().replace(/\n/g, '');
      
      // Parse the pipe-separated values
      const pairs = cleanResult.split('|');
      const parsedData = {};
      
      pairs.forEach(pair => {
        const [key, value] = pair.split(':');
        if (key && value !== undefined) {
          parsedData[key.trim()] = value.trim();
        }
      });

      // Validate that we have the required fields
      if (!parsedData.foodName || !parsedData.category || !parsedData.servingSize_g || !parsedData.calories) {
        setMessage('Error: Missing required fields (foodName, category, servingSize_g, or calories)');
        setTimeout(() => setMessage(''), 5000);
        return;
      }

      // Update the form with parsed data (converting ranges to averages)
      setNewFood({
        name: parsedData.foodName,
        category: parsedData.category,
        servingSize: parseNumericValue(parsedData.servingSize_g),
        calories: parseNumericValue(parsedData.calories),
        isProbiotic: parsedData.containsProbiotics === 'true',
        nutrients: {
          Protein_g: parseNumericValue(parsedData.Protein_g) || '',
          Carbohydrates_g: parseNumericValue(parsedData.Carbohydrates_g) || '',
          Fats_g: parseNumericValue(parsedData.Fats_g) || '',
          Omega3_DHA_EPA_mg: parseNumericValue(parsedData.Omega3_DHA_EPA_mg) || '',
          Vitamin_B12_mcg: parseNumericValue(parsedData.Vitamin_B12_mcg) || '',
          Choline_mg: parseNumericValue(parsedData.Choline_mg) || '',
          Magnesium_mg: parseNumericValue(parsedData.Magnesium_mg) || '',
          Iron_mg: parseNumericValue(parsedData.Iron_mg) || '',
          Zinc_mg: parseNumericValue(parsedData.Zinc_mg) || '',
          Calcium_mg: parseNumericValue(parsedData.Calcium_mg) || '',
          Vitamin_D_mcg: parseNumericValue(parsedData.Vitamin_D_mcg) || '',
          Vitamin_C_mg: parseNumericValue(parsedData.Vitamin_C_mg) || '',
          Fiber_g: parseNumericValue(parsedData.Fiber_g) || '',
          Collagen_g: parseNumericValue(parsedData.Collagen_g) || '',
          Added_Sugars_g: parseNumericValue(parsedData.Added_Sugars_g) || '',
          Sodium_mg: parseNumericValue(parsedData.Sodium_mg) || '',
          Saturated_Fat_g: parseNumericValue(parsedData.Saturated_Fat_g) || '',
          Monounsaturated_Fat_g: parseNumericValue(parsedData.Monounsaturated_Fat_g) || ''
        }
      });

      // Clear any existing errors
      setErrors({});
      
      // Show success message
      setMessage(`✓ Form filled with data for "${parsedData.foodName}"!`);
      setTimeout(() => setMessage(''), 3000);
      
      // Clear the AI result input
      setAiResult('');
      
    } catch (error) {
      console.error('Error parsing AI result:', error);
      setMessage('Error parsing AI result. Please check the format and try again.');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  // Helper function to fill form from already-parsed data object (from backend)
  const parseAiResultFromData = (parsedData) => {
    try {
      // Validate that we have the required fields
      if (!parsedData.foodName || !parsedData.category || !parsedData.servingSize || !parsedData.calories) {
        console.error('❌ Invalid parsed data from backend:', parsedData);
        setMessage('Error: Backend returned incomplete data');
        setTimeout(() => setMessage(''), 5000);
        return;
      }

      // Update the form with parsed data
      setNewFood({
        name: parsedData.foodName,
        category: parsedData.category,
        servingSize: parsedData.servingSize.toString(),
        calories: parsedData.calories.toString(),
        isProbiotic: parsedData.isProbiotic || false,
        nutrients: parsedData.nutrients || {
          Protein_g: '',
          Carbohydrates_g: '',
          Fats_g: '',
          Omega3_DHA_EPA_mg: '',
          Vitamin_B12_mcg: '',
          Choline_mg: '',
          Magnesium_mg: '',
          Iron_mg: '',
          Zinc_mg: '',
          Calcium_mg: '',
          Vitamin_D_mcg: '',
          Vitamin_C_mg: '',
          Fiber_g: '',
          Collagen_g: '',
          Added_Sugars_g: '',
          Sodium_mg: '',
          Saturated_Fat_g: '',
          Monounsaturated_Fat_g: ''
        }
      });

      // Clear any existing errors
      setErrors({});
      console.log(`✅ Form auto-filled with AI data for "${parsedData.foodName}"`);
      // NOTE: Don't clear aiResult here - let user see the raw response
      // Only the manual "Parse & Fill Form" button clears it
      
    } catch (error) {
      console.error('❌ Error filling form from AI data:', error);
      setMessage('Error processing AI data. Please try again.');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  // Analyze food with local LLM
  const analyzeWithLocalLLM = async () => {
    if (!newFood.name) {
      setMessage('Please enter a food name first');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Do a FRESH check right before analyzing (skip cache to ensure we have current status)
    console.log('📍 [FoodLibrary] Doing fresh Ollama check before analysis...');
    const freshStatus = await checkOllamaStatus(llmConfig.ollamaUrl, true);
    setOllamaStatus(freshStatus);

    // Check if Ollama is ACTUALLY available
    if (!freshStatus?.available) {
      console.warn('❌ [FoodLibrary] Ollama not available, showing setup modal');
      setMessage('');
      setShowSetupModal(true);
      return;
    }

    // Check if we have any models
    if (!freshStatus.models || freshStatus.models.length === 0) {
      console.warn('❌ [FoodLibrary] No models found in Ollama');
      setMessage('');
      setShowSetupModal(true);
      return;
    }

    // Check if the configured model is available
    const configuredModelName = llmConfig.model.split(':')[0]; // e.g., "mistral" from "mistral:latest"
    const availableModels = freshStatus.models.map(m => typeof m === 'string' ? m : m.name || '');
    const modelAvailable = availableModels.some(m => m.includes(configuredModelName));

    let modelToUse = llmConfig.model;
    let modelWasAutoSelected = false;
    
    if (!modelAvailable && freshStatus.models.length > 0) {
      // Use the first available model instead
      modelToUse = typeof freshStatus.models[0] === 'string' 
        ? freshStatus.models[0] 
        : freshStatus.models[0].name || llmConfig.model;
      
      modelWasAutoSelected = true;
      console.warn(`⚠️ [FoodLibrary] Configured model "${llmConfig.model}" not found. Using "${modelToUse}" instead`);
    }

    setIsAnalyzing(true);
    
    // Show which model is being used - VISIBLE TO USER
    if (modelWasAutoSelected) {
      setMessage(`🤖 Using available model: ${modelToUse} with web search (${(freshStatus.models.length)} installed). This may take 30-120 seconds...`);
    } else {
      setMessage(`🤖 Analyzing with ${modelToUse} and web search... this may take 30-120 seconds`);
    }

    try {
      const response = await fetch(apiUrl('/api/ai/analyze-food'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          foodData: {
            name: newFood.name,
            servingSize: newFood.servingSize,
            calories: newFood.calories,
            category: newFood.category,
          },
          ollamaUrl: llmConfig.ollamaUrl,
          model: modelToUse,
          useLocal: true,
          useWebSearch: true,
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        console.log('🌐 [FoodLibrary] Web search context:', result.search);
        // Set the raw response in the AI Result textarea (Step 2)
        if (result.rawResponse) {
          setAiResult(result.rawResponse);
          // Auto-parse and fill the form
          setTimeout(() => {
            parseAiResultFromData(result.data);
          }, 100);
        } else {
          // Fallback: directly populate the form if no raw response
          setNewFood({
            name: result.data.foodName,
            category: result.data.category,
            servingSize: result.data.servingSize.toString(),
            calories: result.data.calories.toString(),
            isProbiotic: result.data.isProbiotic,
            nutrients: result.data.nutrients,
          });
        }

        setErrors({});
        setMessage(result.search?.enabled
          ? `✓ AI analysis complete for "${result.data.foodName}" using ${modelToUse} with web search!`
          : `✓ AI analysis complete for "${result.data.foodName}" using ${modelToUse}!`);
        setTimeout(() => setMessage(''), 4000);
      } else {
        const errorMsg = result.error || 'Unknown error';
        console.error('❌ [FoodLibrary] Analysis error:', errorMsg);
        
        // Check if it's a model not found error
        if (errorMsg.includes('404') || errorMsg.includes('model') || errorMsg.includes('not found')) {
          setMessage(`❌ Model "${modelToUse}" not found in Ollama. Available models: ${availableModels.join(', ')}`);
          // Show setup modal with available models info
          setShowSetupModal(true);
          return;
        }

        // If error is about Ollama connection, show setup modal
        if (errorMsg.toLowerCase().includes('connection') || 
            errorMsg.toLowerCase().includes('not available') ||
            errorMsg.toLowerCase().includes('refused') ||
            errorMsg.toLowerCase().includes('timeout')) {
          setShowSetupModal(true);
          setMessage('');
          return;
        }

        setMessage(`❌ Analysis failed: ${errorMsg}`);
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('❌ [FoodLibrary] Network error:', error);
      
      // Network error usually means Ollama not running
      setShowSetupModal(true);
      setMessage('');
      return;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Retry Ollama detection
  const handleRetryOllama = async () => {
    clearCache();
    const status = await checkOllamaStatus(llmConfig.ollamaUrl);
    setOllamaStatus(status);
    
    if (status.available) {
      setShowSetupModal(false);
      setMessage('✓ Ollama detected! You can now use AI analysis.');
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('❌ Ollama still not found. Make sure it\'s installed and running.');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  return (
    <div className="food-library-tab">
      <div className="food-library-container">
        <div className="food-library-header">
          <h2>Food Library</h2>
          <p className="food-library-description">
            Manage your personal food database. Add new foods with their nutritional information.
          </p>
        </div>

        {message && (
          <div className={`message ${message.includes('✓') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="food-library-actions">
          <button
            className="add-food-button"
            onClick={() => setIsAddingFood(true)}
            disabled={isAddingFood}
          >
            + Add New Food
          </button>
        </div>

        {isAddingFood && (
          <div className="add-food-form">
            <h3>{editingFood ? `Edit ${editingFood}` : 'Add New Food'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Food Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newFood.name}
                    onChange={handleInputChange}
                    className={errors.name ? 'input-error' : ''}
                    placeholder="e.g., Chicken Breast"
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={newFood.category}
                    onChange={handleInputChange}
                    className={errors.category ? 'input-error' : ''}
                  >
                    <option value="">Select Category</option>
                    <option value="Protein">Protein</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Grains">Grains</option>
                    <option value="Nuts & Seeds">Nuts & Seeds</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.category && <span className="error-text">{errors.category}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="servingSize">Serving Size (g) *</label>
                  <input
                    type="number"
                    id="servingSize"
                    name="servingSize"
                    value={newFood.servingSize}
                    onChange={handleInputChange}
                    className={errors.servingSize ? 'input-error' : ''}
                    placeholder="100"
                    min="0"
                    step="any"
                  />
                  {errors.servingSize && <span className="error-text">{errors.servingSize}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="calories">Calories *</label>
                  <input
                    type="number"
                    id="calories"
                    name="calories"
                    value={newFood.calories}
                    onChange={handleInputChange}
                    className={errors.calories ? 'input-error' : ''}
                    placeholder="150"
                    min="0"
                    step="any"
                  />
                  {errors.calories && <span className="error-text">{errors.calories}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isProbiotic"
                    checked={newFood.isProbiotic}
                    onChange={handleInputChange}
                  />
                  Contains Probiotics
                </label>
              </div>

              <div className="ai-tools-section">
                <button 
                  type="button"
                  className="ai-tools-toggle"
                  onClick={() => setShowAiTools(!showAiTools)}
                >
                  <div className="ai-tools-header">
                    <div className="ai-tools-icon">🤖</div>
                    <div className="ai-tools-title">
                      <span className="ai-tools-main-title">AI Nutrition Assistant</span>
                      <span className="ai-tools-subtitle">Let AI analyze your food's nutritional profile</span>
                    </div>
                    <div className={`ai-tools-arrow ${showAiTools ? 'expanded' : ''}`}>
                      ▼
                    </div>
                  </div>
                </button>

                {showAiTools && (
                  <div className="ai-tools-content">
                    <div className="ai-tools-description">
                      <p>✨ Generate comprehensive nutritional data using AI. Perfect for foods with incomplete nutrition labels or when you need detailed micronutrient analysis.</p>
                    </div>

                    <div className="prompt-section">
                      <div className="prompt-header">
                        <button 
                          type="button"
                          className="copy-prompt-button"
                          onClick={() => copyPromptToClipboard()}
                          title="Copy prompt to clipboard"
                        >
                          📋 Copy Prompt
                        </button>
                        <div className="ai-model-selector">
                          <label htmlFor="model-select" style={{ fontSize: '0.85em', marginRight: '6px', color: '#666' }}>
                            Model:
                          </label>
                          <select 
                            id="model-select"
                            value={llmConfig.model}
                            onChange={(e) => setLlmConfig(prev => ({ ...prev, model: e.target.value }))}
                            disabled={!ollamaStatus?.available || isAnalyzing}
                            style={{ 
                              padding: '4px 8px', 
                              borderRadius: '4px', 
                              border: '1px solid #ddd',
                              fontSize: '0.85em',
                              minWidth: '150px'
                            }}
                          >
                            {ollamaStatus?.models && ollamaStatus.models.length > 0 ? (
                              ollamaStatus.models.map((model) => {
                                const modelName = typeof model === 'string' ? model : model.name;
                                return <option key={modelName} value={modelName}>{modelName}</option>;
                              })
                            ) : (
                              <option value={llmConfig.model}>{llmConfig.model}</option>
                            )}
                          </select>
                        </div>
                        <div className="analyze-button-container">
                          <button 
                            type="button"
                            className={`analyze-local-button ${ollamaStatus?.available ? 'available' : 'unavailable'}`}
                            onClick={() => analyzeWithLocalLLM()}
                            disabled={isAnalyzing}
                            title={ollamaStatus?.available ? 'Analyze using local Ollama LLM' : 'Click to set up Ollama'}
                          >
                            {isAnalyzing ? '⏳ Analyzing...' : '🤖 Analyze with Local AI'}
                          </button>
                          <span className={`ollama-indicator ${ollamaStatus?.available ? 'connected' : 'disconnected'}`}>
                            {ollamaStatus?.available ? '🟢' : '🔴'}
                          </span>
                        </div>
                        <span className="prompt-label">Step 1: Generate AI Prompt</span>
                      </div>
                      <div className="prompt-content">
                        <p className="prompt-text">
                          FoodName: {newFood.name || '[Food Name]'}, servingSize: {newFood.servingSize || '[Serving Size]'}, calories: {newFood.calories || '[Calories]'}.
                        </p>
                        <p className="prompt-text">
                          These values may be null, at which point you should make a reasonable, evidence-based estimate for a typical serving. Output only the formatted line, with no explanations or additional text.
                        </p>
                        <p className="prompt-text">
                          Write a dissectable line formatted as follows:
                        </p>
                        <p className="prompt-text prompt-format">
                          foodName:{newFood.name || '[name]'}|category:{newFood.category || '[category]'}|servingSize_g:{newFood.servingSize || '[servingSize]'}|calories:{newFood.calories || '[calories]'}|containsProbiotics:{newFood.isProbiotic}|Protein_g:{newFood.nutrients.Protein_g || '[val]'}|Carbohydrates_g:{newFood.nutrients.Carbohydrates_g || '[val]'}|Fats_g:{newFood.nutrients.Fats_g || '[val]'}|Omega3_DHA_EPA_mg:{newFood.nutrients.Omega3_DHA_EPA_mg || '[val]'}|Vitamin_B12_mcg:{newFood.nutrients.Vitamin_B12_mcg || '[val]'}|Choline_mg:{newFood.nutrients.Choline_mg || '[val]'}|Magnesium_mg:{newFood.nutrients.Magnesium_mg || '[val]'}|Iron_mg:{newFood.nutrients.Iron_mg || '[val]'}|Zinc_mg:{newFood.nutrients.Zinc_mg || '[val]'}|Calcium_mg:{newFood.nutrients.Calcium_mg || '[val]'}|Vitamin_D_mcg:{newFood.nutrients.Vitamin_D_mcg || '[val]'}|Vitamin_C_mg:{newFood.nutrients.Vitamin_C_mg || '[val]'}|Fiber_g:{newFood.nutrients.Fiber_g || '[val]'}|Collagen_g:{newFood.nutrients.Collagen_g || '[val]'}|Added_Sugars_g:{newFood.nutrients.Added_Sugars_g || '[val]'}|Sodium_mg:{newFood.nutrients.Sodium_mg || '[val]'}|Saturated_Fat_g:{newFood.nutrients.Saturated_Fat_g || '[val]'}|Monounsaturated_Fat_g:{newFood.nutrients.Monounsaturated_Fat_g || '[val]'}
                        </p>
                        <p className="prompt-text">
                          A food tracker will dissect the line to fill in the user's nutrition library, so be as thorough and realistic as possible with all nutrient values. Use your best nutritional knowledge to estimate missing information when data is incomplete.
                        </p>
                      </div>
                    </div>

                    <div className="result-section">
                      <div className="result-header">
                        <span className="result-label">Step 2: Parse AI Response</span>
                        <span style={{ fontSize: '0.75em', color: '#666', fontStyle: 'italic', marginLeft: '8px' }}>
                          (Ranges like "100-200" will be averaged to 150)
                        </span>
                      </div>
                      <div className="result-input-container">
                        <textarea
                          className="result-input"
                          placeholder="Paste the AI result here (e.g., foodName:Greek Yogurt|category:Dairy|servingSize_g:227|calories:120|containsProbiotics:true|Protein_g:23|...)"
                          value={aiResult}
                          onChange={(e) => setAiResult(e.target.value)}
                          rows={3}
                        />
                        <button 
                          type="button"
                          className="parse-result-button"
                          onClick={() => parseAiResult()}
                          disabled={!aiResult.trim()}
                          title="Parse AI result and fill form"
                        >
                          🔄 Parse & Fill Form
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="nutrients-section">
                <h4>Nutrients (per serving)</h4>
                <div className="nutrients-grid">
                  {Object.entries(newFood.nutrients).map(([nutrient, value]) => (
                    <div key={nutrient} className="form-group">
                      <label htmlFor={nutrient}>{nutrient.replace(/_/g, ' ')}</label>
                      <input
                        type="number"
                        id={nutrient}
                        name={`nutrients.${nutrient}`}
                        value={value}
                        onChange={handleInputChange}
                        className={errors[`nutrients.${nutrient}`] ? 'input-error' : ''}
                        placeholder="0"
                        min="0"
                        step="any"
                      />
                      {errors[`nutrients.${nutrient}`] && (
                        <span className="error-text">{errors[`nutrients.${nutrient}`]}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  {editingFood ? 'Update Food' : 'Add Food'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="food-library-list">
          <h3>Current Foods ({Object.keys(foodLibrary).length})</h3>
          {Object.keys(foodLibrary).length > 0 ? (
            <div className="food-grid">
              {Object.entries(foodLibrary).map(([foodName, foodData]) => (
                <div key={foodName} className="food-card">
                  <div className="food-card-header">
                    <h4>{foodName}</h4>
                    <div className="food-card-actions">
                      <span className="food-category">{foodData.Metadata.Category}</span>
                      <div className="food-card-buttons">
                        <button 
                          className="edit-food-button"
                          onClick={() => handleEditFood(foodName, foodData)}
                          title="Edit food"
                        >
                          ✏️
                        </button>
                        <button 
                          className="delete-food-button"
                          onClick={() => setShowDeleteConfirm(foodName)}
                          title="Delete food"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="food-card-content">
                    <div className="food-meta">
                      <span>Serving: {foodData.Metadata.ServingSize_g}g</span>
                      <span>Calories: {foodData.Metadata.Calories_kcal}</span>
                      {foodData.Metadata.IsProbiotic && <span className="probiotic">Probiotic</span>}
                    </div>
                    <div className="food-nutrients">
                      <div className="macro-nutrients">
                        <span>Protein: {foodData.Nutrients.Protein_g}g</span>
                        <span>Carbs: {foodData.Nutrients.Carbohydrates_g}g</span>
                        <span>Fats: {foodData.Nutrients.Fats_g}g</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-foods">No foods in library yet. Add your first food above!</p>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="delete-confirmation-modal">
            <div className="delete-confirmation-content">
              <h3>Confirm Delete</h3>
              <p>Are you sure you want to delete "{showDeleteConfirm}"? This action cannot be undone.</p>
              <div className="delete-confirmation-actions">
                <button 
                  className="cancel-delete-button"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button 
                  className="confirm-delete-button"
                  onClick={() => handleDeleteFood(showDeleteConfirm)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ollama Setup Modal */}
      <OllamaSetupModal 
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        onRetry={handleRetryOllama}
        detectedModels={ollamaStatus?.models || []}
        ollamaIsRunning={ollamaStatus?.available}
      />
    </div>
  );
};

export default FoodLibraryTab;
