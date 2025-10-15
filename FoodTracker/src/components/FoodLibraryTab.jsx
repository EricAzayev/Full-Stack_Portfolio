import React, { useState, useEffect } from 'react';

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
      Collagen_g: ''
    }
  });
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [editingFood, setEditingFood] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Fetch food library data
  useEffect(() => {
    const fetchFoodLibrary = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/foodLibrary');
        const data = await response.json();
        setFoodLibrary(data);
      } catch (error) {
        console.error('Error fetching food library:', error);
        setMessage('Failed to load food library');
      }
    };

    fetchFoodLibrary();
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
        ? `http://localhost:3001/api/foodLibrary/${encodeURIComponent(editingFood)}`
        : 'http://localhost:3001/api/foodLibrary';
      
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
            Collagen_g: ''
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
        Collagen_g: ''
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
        Collagen_g: foodData.Nutrients.Collagen_g.toString()
      }
    });
    setIsAddingFood(true);
  };

  // Handle delete food
  const handleDeleteFood = async (foodName) => {
    try {
      const response = await fetch(`http://localhost:3001/api/foodLibrary/${encodeURIComponent(foodName)}`, {
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

foodName:${newFood.name || '[name]'}|category:${newFood.category || '[category]'}|servingSize_g:${newFood.servingSize || '[servingSize]'}|calories:${newFood.calories || '[calories]'}|containsProbiotics:${newFood.isProbiotic}|Protein_g:${newFood.nutrients.Protein_g || '[val]'}|Carbohydrates_g:${newFood.nutrients.Carbohydrates_g || '[val]'}|Fats_g:${newFood.nutrients.Fats_g || '[val]'}|Omega3_DHA_EPA_mg:${newFood.nutrients.Omega3_DHA_EPA_mg || '[val]'}|Vitamin_B12_mcg:${newFood.nutrients.Vitamin_B12_mcg || '[val]'}|Choline_mg:${newFood.nutrients.Choline_mg || '[val]'}|Magnesium_mg:${newFood.nutrients.Magnesium_mg || '[val]'}|Iron_mg:${newFood.nutrients.Iron_mg || '[val]'}|Zinc_mg:${newFood.nutrients.Zinc_mg || '[val]'}|Calcium_mg:${newFood.nutrients.Calcium_mg || '[val]'}|Vitamin_D_mcg:${newFood.nutrients.Vitamin_D_mcg || '[val]'}|Vitamin_C_mg:${newFood.nutrients.Vitamin_C_mg || '[val]'}|Fiber_g:${newFood.nutrients.Fiber_g || '[val]'}|Collagen_g:${newFood.nutrients.Collagen_g || '[val]'}

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
                    step="0.1"
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
                    step="0.1"
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
                  <span className="prompt-label">AI Prompt for Nutritional Analysis:</span>
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
                    foodName:{newFood.name || '[name]'}|category:{newFood.category || '[category]'}|servingSize_g:{newFood.servingSize || '[servingSize]'}|calories:{newFood.calories || '[calories]'}|containsProbiotics:{newFood.isProbiotic}|Protein_g:{newFood.nutrients.Protein_g || '[val]'}|Carbohydrates_g:{newFood.nutrients.Carbohydrates_g || '[val]'}|Fats_g:{newFood.nutrients.Fats_g || '[val]'}|Omega3_DHA_EPA_mg:{newFood.nutrients.Omega3_DHA_EPA_mg || '[val]'}|Vitamin_B12_mcg:{newFood.nutrients.Vitamin_B12_mcg || '[val]'}|Choline_mg:{newFood.nutrients.Choline_mg || '[val]'}|Magnesium_mg:{newFood.nutrients.Magnesium_mg || '[val]'}|Iron_mg:{newFood.nutrients.Iron_mg || '[val]'}|Zinc_mg:{newFood.nutrients.Zinc_mg || '[val]'}|Calcium_mg:{newFood.nutrients.Calcium_mg || '[val]'}|Vitamin_D_mcg:{newFood.nutrients.Vitamin_D_mcg || '[val]'}|Vitamin_C_mg:{newFood.nutrients.Vitamin_C_mg || '[val]'}|Fiber_g:{newFood.nutrients.Fiber_g || '[val]'}|Collagen_g:{newFood.nutrients.Collagen_g || '[val]'}
                  </p>
                  <p className="prompt-text">
                    A food tracker will dissect the line to fill in the user's nutrition library, so be as thorough and realistic as possible with all nutrient values. Use your best nutritional knowledge to estimate missing information when data is incomplete.
                  </p>
                </div>
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
                        step="0.1"
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
    </div>
  );
};

export default FoodLibraryTab;
