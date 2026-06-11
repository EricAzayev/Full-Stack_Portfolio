import React, { useState, useEffect } from "react";
import { checkOllamaStatus } from '../services/ollamaDetection';
import { apiUrl } from '../services/api';

const UserTab = () => {
  const [userData, setUserData] = useState({
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    activityLevel: "",
    calorieGoal: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [recommendations, setRecommendations] = useState({
    Calories_kcal: 0,
    Protein_g: 0,
    Carbohydrates_g: 0,
    Fats_g: 0,
    Omega3_DHA_EPA_mg: 0,
    Vitamin_B12_mcg: 0,
    Choline_mg: 0,
    Magnesium_mg: 0,
    Iron_mg: 0,
    Zinc_mg: 0,
    Calcium_mg: 0,
    Vitamin_D_mcg: 0,
    Vitamin_C_mg: 0,
    Fiber_g: 0,
    Collagen_g: 0,
    Added_Sugars_g: 0,
    Sodium_mg: 0,
    Saturated_Fat_g: 0,
    Monounsaturated_Fat_g: 0,
  });
  const [showAllNutrients, setShowAllNutrients] = useState(false);
  const [llmConfig, setLlmConfig] = useState({
    ollamaUrl: 'http://localhost:11434',
    model: 'mistral:latest',
  });
  const [ollamaStatus, setOllamaStatus] = useState(null);
  const [checkingOllama, setCheckingOllama] = useState(false);
  const [originalUserData, setOriginalUserData] = useState(null);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [updatingRecommendations, setUpdatingRecommendations] = useState(false);
  const [unitSystem, setUnitSystem] = useState('imperial'); // 'imperial' or 'metric'
  const [displayHeight, setDisplayHeight] = useState({ feet: '', inches: '' });
  const [displayWeight, setDisplayWeight] = useState('');

  // Conversion functions
  const cmToFeetInches = (cm) => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return { feet, inches };
  };

  const feetInchesToCm = (feet, inches) => {
    const totalInches = (Number(feet) * 12) + Number(inches);
    return Math.round(totalInches * 2.54 * 10) / 10; // Round to 1 decimal
  };

  const kgToLbs = (kg) => {
    return Math.round(kg * 2.20462 * 10) / 10; // Round to 1 decimal
  };

  const lbsToKg = (lbs) => {
    return Math.round(lbs / 2.20462 * 10) / 10; // Round to 1 decimal
  };

  // Update display values when unitSystem changes
  useEffect(() => {
    if (userData.height && userData.weight) {
      if (unitSystem === 'imperial') {
        setDisplayHeight(cmToFeetInches(userData.height));
        setDisplayWeight(kgToLbs(userData.weight));
      } else {
        setDisplayHeight({ feet: '', inches: '' });
        setDisplayWeight(userData.weight);
      }
    }
  }, [unitSystem]); // Only run when unit system changes, not on every weight/height change

  // Fetch user data and recommendations on component mount
  useEffect(() => {
    const checkOllama = async () => {
      const status = await checkOllamaStatus(llmConfig.ollamaUrl);
      setOllamaStatus(status);
      
      // Auto-select first available model if current model isn't available
      if (status?.available && status.models && status.models.length > 0) {
        const modelNames = status.models.map(m => typeof m === 'string' ? m : m.name);
        if (!modelNames.includes(llmConfig.model)) {
          const firstModel = modelNames[0];
          console.log(`📍 [UserTab] Model "${llmConfig.model}" not found, using "${firstModel}"`);
          setLlmConfig(prev => ({ ...prev, model: firstModel }));
        }
      }
    };

    fetchUserData();
    fetchRecommendations();
    checkOllama();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch(apiUrl('/api/user'));
      const data = await response.json();
      setUserData(data);
      setOriginalUserData(data); // Store original for comparison
      
      // Set display values based on current unit system
      if (data.height && data.weight) {
        if (unitSystem === 'imperial') {
          setDisplayHeight(cmToFeetInches(data.height));
          setDisplayWeight(kgToLbs(data.weight));
        } else {
          setDisplayHeight({ feet: '', inches: '' });
          setDisplayWeight(data.weight);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setSaveMessage("Failed to load user data");
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(apiUrl('/api/recommendations'));
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      } else {
        console.error("Error fetching recommendations");
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  const handleCheckOllama = async () => {
    setCheckingOllama(true);
    try {
      const status = await checkOllamaStatus(llmConfig.ollamaUrl);
      setOllamaStatus(status);
      
      // Auto-select first available model if current model isn't available
      if (status?.available && status.models && status.models.length > 0) {
        const modelNames = status.models.map(m => typeof m === 'string' ? m : m.name);
        if (!modelNames.includes(llmConfig.model)) {
          const firstModel = modelNames[0];
          console.log(`📍 [UserTab] Model "${llmConfig.model}" not found, using "${firstModel}"`);
          setLlmConfig(prev => ({ ...prev, model: firstModel }));
        }
      }
    } catch (error) {
      console.error('Error checking Ollama:', error);
    } finally {
      setCheckingOllama(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!userData.name || userData.name.trim() === "") {
      newErrors.name = "Name is required";
    }

    if (!userData.age || userData.age < 1 || userData.age > 120) {
      newErrors.age = "Please enter a valid age (1-120)";
    }

    // Height validation (always stored in cm)
    if (!userData.height || userData.height < 50 || userData.height > 300) {
      if (unitSystem === 'imperial') {
        newErrors.height = "Please enter a valid height (3-10 feet)";
      } else {
        newErrors.height = "Please enter a valid height in cm (50-300)";
      }
    }

    // Weight validation (always stored in kg)
    if (!userData.weight || userData.weight < 20 || userData.weight > 500) {
      if (unitSystem === 'imperial') {
        newErrors.weight = "Please enter a valid weight (44-1100 lbs)";
      } else {
        newErrors.weight = "Please enter a valid weight in kg (20-500)";
      }
    }

    if (
      !userData.calorieGoal ||
      userData.calorieGoal < 1000 ||
      userData.calorieGoal > 10000
    ) {
      newErrors.calorieGoal = "Please enter a valid calorie goal (1000-10000)";
    }

    if (!userData.gender) {
      newErrors.gender = "Please select a gender";
    }

    if (!userData.activityLevel) {
      newErrors.activityLevel = "Please select an activity level";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle imperial height inputs
    if (name === 'heightFeet' || name === 'heightInches') {
      const newDisplayHeight = { ...displayHeight, [name.replace('height', '').toLowerCase()]: value };
      setDisplayHeight(newDisplayHeight);
      if (newDisplayHeight.feet && newDisplayHeight.inches !== '') {
        const cm = feetInchesToCm(newDisplayHeight.feet, newDisplayHeight.inches);
        setUserData(prev => ({ ...prev, height: cm }));
      }
      if (errors.height) {
        setErrors((prev) => ({ ...prev, height: "" }));
      }
      return;
    }
    
    // Handle imperial weight input
    if (name === 'weightLbs') {
      setDisplayWeight(value);
      if (value) {
        const kg = lbsToKg(Number(value));
        setUserData(prev => ({ ...prev, weight: kg }));
      }
      if (errors.weight) {
        setErrors((prev) => ({ ...prev, weight: "" }));
      }
      return;
    }
    
    setUserData((prev) => ({
      ...prev,
      [name]:
        name === "age" ||
        name === "height" ||
        name === "weight" ||
        name === "calorieGoal"
          ? Number(value)
          : value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setSaveMessage("Please fix the errors below");
      return;
    }

    setIsSaving(true);
    setSaveMessage("");

    try {
      const response = await fetch(apiUrl('/api/user'), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const result = await response.json();
        setSaveMessage("Settings saved successfully!");
        setIsEditing(false);
        // Update originalUserData so change detection works correctly
        setOriginalUserData(userData);
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        setSaveMessage("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving user data:", error);
      setSaveMessage("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    fetchUserData(); // Reset to original data
    setIsEditing(false);
    setErrors({});
    setSaveMessage("");
  };

  // Check if recommendation-affecting fields have changed
  const hasRecommendationFieldsChanged = () => {
    if (!originalUserData || !isEditing) return false;
    return (
      userData.age !== originalUserData.age ||
      userData.gender !== originalUserData.gender ||
      userData.height !== originalUserData.height ||
      userData.weight !== originalUserData.weight ||
      userData.activityLevel !== originalUserData.activityLevel
    );
  };

  // Update recommendations using standard formula
  const updateWithFormula = async () => {
    setUpdatingRecommendations(true);
    try {
      const response = await fetch(apiUrl('/api/recommendations/calculate'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("📊 [Standard Formula] User data used:");
        console.log({
          age: userData.age,
          gender: userData.gender,
          weight: userData.weight,
          height: userData.height,
          activityLevel: userData.activityLevel,
          calorieGoal: userData.calorieGoal
        });
        console.log("📊 [Standard Formula] Calculated recommendations:");
        console.log(data);
        setRecommendations(data);
        setSaveMessage("✓ Recommendations updated using standard formula!");
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        setSaveMessage("Failed to update recommendations");
      }
    } catch (error) {
      console.error("Error updating recommendations:", error);
      setSaveMessage("Error updating recommendations");
    } finally {
      setUpdatingRecommendations(false);
      setShowRecommendationModal(false);
    }
  };

  // Update recommendations using AI/LLM
  const updateWithAI = async () => {
    setUpdatingRecommendations(true);
    try {
      const response = await fetch(apiUrl('/api/ai/generate-recommendations'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userData,
          ollamaUrl: llmConfig.ollamaUrl,
          model: llmConfig.model,
          useWebSearch: true,
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log("🤖 [AI Recommendation] Response structure:", result);
        if (result.success && result.data) {
          console.log("🤖 [AI Recommendation] Prompt sent to model:");
          console.log(result.prompt || "(Prompt not included in response)");
          console.log("🤖 [AI Recommendation] Raw response:");
          console.log(result.rawResponse);
          console.log("🌐 [AI Recommendation] Web search context:");
          console.log(result.search);
          console.log("🤖 [AI Recommendation] Parsed recommendations:");
          console.log(result.data);
          setRecommendations(result.data);
          setSaveMessage(result.search?.enabled
            ? "✓ Personalized recommendations generated by AI with web search!"
            : "✓ Personalized recommendations generated by AI!");
          setTimeout(() => setSaveMessage(""), 3000);
        } else {
          setSaveMessage("AI analysis failed: " + (result.error || "Unknown error"));
        }
      } else {
        setSaveMessage("Failed to generate AI recommendations");
      }
    } catch (error) {
      console.error("Error generating AI recommendations:", error);
      setSaveMessage("Error generating AI recommendations");
    } finally {
      setUpdatingRecommendations(false);
      setShowRecommendationModal(false);
    }
  };

  const calculateBMI = () => {
    if (userData.height && userData.weight) {
      const heightInMeters = userData.height / 100;
      const bmi = userData.weight / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return "N/A";
  };

  const getBMICategory = (bmi) => {
    if (bmi === "N/A") return "";
    const bmiNum = parseFloat(bmi);
    if (bmiNum < 18.5) return "Underweight";
    if (bmiNum < 25) return "Normal weight";
    if (bmiNum < 30) return "Overweight";
    return "Obese";
  };

  const bmi = calculateBMI();
  const bmiCategory = getBMICategory(bmi);

  return (
    <div className="user-tab">
      <div className="user-settings-container">
        <div className="settings-header">
          <div>
            <h2>User Settings</h2>
            <p className="settings-subtitle">
              Manage your personal information and preferences
            </p>
          </div>
          {!isEditing ? (
            <button className="edit-button" onClick={() => setIsEditing(true)}>
              <span className="edit-icon">✏️</span> Edit Profile
            </button>
          ) : (
            <div className="action-buttons">
              <button
                className="cancel-button"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className="save-button"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        {saveMessage && (
          <div
            className={`save-message ${
              saveMessage.includes("success") ? "success" : "error"
            }`}
          >
            {saveMessage}
          </div>
        )}

        <div className="settings-content">
          {/* Personal Information Section */}
          <section className="settings-section">
            <h3 className="section-title">Personal Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={userData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={errors.name ? "input-error" : ""}
                />
                {errors.name && (
                  <span className="error-text">{errors.name}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="age">Age</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={userData.age}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  min="1"
                  max="120"
                  className={errors.age ? "input-error" : ""}
                />
                {errors.age && <span className="error-text">{errors.age}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={userData.gender}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={errors.gender ? "input-error" : ""}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <span className="error-text">{errors.gender}</span>
                )}
              </div>
            </div>
          </section>

          {/* Physical Measurements Section */}
          <section className="settings-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="section-title" style={{ margin: 0 }}>Physical Measurements</h3>
              <button
                type="button"
                onClick={() => setUnitSystem(unitSystem === 'imperial' ? 'metric' : 'imperial')}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.85rem',
                  backgroundColor: '#646cff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
                title="Toggle between Imperial and Metric units"
              >
                {unitSystem === 'imperial' ? '📏 Switch to Metric' : '📏 Switch to Imperial'}
              </button>
            </div>
            <div className="form-grid">
              {unitSystem === 'imperial' ? (
                <>
                  <div className="form-group">
                    <label>Height (ft/in)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <input
                          type="number"
                          name="heightFeet"
                          value={displayHeight.feet}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          min="3"
                          max="10"
                          placeholder="Feet"
                          className={errors.height ? "input-error" : ""}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <input
                          type="number"
                          name="heightInches"
                          value={displayHeight.inches}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          min="0"
                          max="11"
                          placeholder="Inches"
                          className={errors.height ? "input-error" : ""}
                        />
                      </div>
                    </div>
                    {errors.height && (
                      <span className="error-text">{errors.height}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="weightLbs">Weight (lbs)</label>
                    <input
                      type="number"
                      id="weightLbs"
                      name="weightLbs"
                      value={displayWeight}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      min="44"
                      max="1100"
                      step="0.1"
                      className={errors.weight ? "input-error" : ""}
                    />
                    {errors.weight && (
                      <span className="error-text">{errors.weight}</span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label htmlFor="height">Height (cm)</label>
                    <input
                      type="number"
                      id="height"
                      name="height"
                      value={userData.height}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      min="50"
                      max="300"
                      step="0.1"
                      className={errors.height ? "input-error" : ""}
                    />
                    {errors.height && (
                      <span className="error-text">{errors.height}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="weight">Weight (kg)</label>
                    <input
                      type="number"
                      id="weight"
                      name="weight"
                      value={userData.weight}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      min="20"
                      max="500"
                      step="0.1"
                      className={errors.weight ? "input-error" : ""}
                    />
                    {errors.weight && (
                      <span className="error-text">{errors.weight}</span>
                    )}
                  </div>
                </>
              )}

              <div className="form-group bmi-display">
                <label>BMI</label>
                <div className="bmi-info">
                  <span className="bmi-value">{bmi}</span>
                  {bmiCategory && (
                    <span className="bmi-category">{bmiCategory}</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Activity & Goals Section */}
          <section className="settings-section">
            <h3 className="section-title">Activity & Goals</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="activityLevel">Activity Level</label>
                <select
                  id="activityLevel"
                  name="activityLevel"
                  value={userData.activityLevel}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={errors.activityLevel ? "input-error" : ""}
                >
                  <option value="">Select activity level</option>
                  <option value="sedentary">
                    Sedentary (little or no exercise)
                  </option>
                  <option value="light">Light (exercise 1-3 days/week)</option>
                  <option value="moderate">
                    Moderate (exercise 3-5 days/week)
                  </option>
                  <option value="active">
                    Active (exercise 6-7 days/week)
                  </option>
                  <option value="very active">
                    Very Active (intense exercise daily)
                  </option>
                </select>
                {errors.activityLevel && (
                  <span className="error-text">{errors.activityLevel}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="calorieGoal">Daily Calorie Goal (kcal)</label>
                <input
                  type="number"
                  id="calorieGoal"
                  name="calorieGoal"
                  value={userData.calorieGoal}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  min="1000"
                  max="10000"
                  step="50"
                  className={errors.calorieGoal ? "input-error" : ""}
                />
                {errors.calorieGoal && (
                  <span className="error-text">{errors.calorieGoal}</span>
                )}
              </div>
            </div>
          </section>

          {/* Daily Recommendations Section */}
          <section className="settings-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 className="section-title" style={{ marginBottom: '0.5rem' }}>Daily Recommendations</h3>
                <p style={{ color: '#ccc', lineHeight: '1.5', margin: 0 }}>
                  Your personalized daily nutrient targets based on your profile settings.
                </p>
              </div>
              {hasRecommendationFieldsChanged() && (
                <button
                  className="update-recommendations-button"
                  onClick={() => setShowRecommendationModal(true)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    boxShadow: '0 4px 6px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  🔄 Update Recommendations
                </button>
              )}
            </div>
            
            <div className="nutrient-summary">
              <div className="nutrient-item">
                <span>Calories:</span>
                <span>{recommendations.Calories_kcal || 0}</span>
              </div>
              <div className="nutrient-item">
                <span>Protein:</span>
                <span>{recommendations.Protein_g || 0}g</span>
              </div>
              <div className="nutrient-item">
                <span>Carbs:</span>
                <span>{recommendations.Carbohydrates_g || 0}g</span>
              </div>
              <div className="nutrient-item">
                <span>Fats:</span>
                <span>{recommendations.Fats_g || 0}g</span>
              </div>
              <div className="nutrient-item">
                <span>Omega-3:</span>
                <span>{recommendations.Omega3_DHA_EPA_mg || 0}mg</span>
              </div>
              <div className="nutrient-item">
                <span>Vitamin B12:</span>
                <span>{recommendations.Vitamin_B12_mcg || 0}μg</span>
              </div>
              <div className="nutrient-item">
                <span>Calcium:</span>
                <span>{recommendations.Calcium_mg || 0}mg</span>
              </div>
              <div className="nutrient-item">
                <span>Magnesium:</span>
                <span>{recommendations.Magnesium_mg || 0}mg</span>
              </div>
              
              {showAllNutrients && (
                <>
                  <div className="nutrient-item">
                    <span>Choline:</span>
                    <span>{recommendations.Choline_mg || 0}mg</span>
                  </div>
                  <div className="nutrient-item">
                    <span>Iron:</span>
                    <span>{recommendations.Iron_mg || 0}mg</span>
                  </div>
                  <div className="nutrient-item">
                    <span>Zinc:</span>
                    <span>{recommendations.Zinc_mg || 0}mg</span>
                  </div>
                  <div className="nutrient-item">
                    <span>Vitamin D:</span>
                    <span>{recommendations.Vitamin_D_mcg || 0}μg</span>
                  </div>
                  <div className="nutrient-item">
                    <span>Vitamin C:</span>
                    <span>{recommendations.Vitamin_C_mg || 0}mg</span>
                  </div>
                  <div className="nutrient-item">
                    <span>Fiber:</span>
                    <span>{recommendations.Fiber_g || 0}g</span>
                  </div>
                  <div className="nutrient-item">
                    <span>Collagen:</span>
                    <span>{recommendations.Collagen_g || 0}g</span>
                  </div>
                  <div className="nutrient-item">
                    <span>Added Sugars:</span>
                    <span>{recommendations.Added_Sugars_g || 0}g</span>
                  </div>
                  <div className="nutrient-item">
                    <span>Sodium:</span>
                    <span>{recommendations.Sodium_mg || 0}mg</span>
                  </div>
                  <div className="nutrient-item">
                    <span>Saturated Fat:</span>
                    <span>{recommendations.Saturated_Fat_g || 0}g</span>
                  </div>
                  <div className="nutrient-item">
                    <span>Monounsaturated Fat:</span>
                    <span>{recommendations.Monounsaturated_Fat_g || 0}g</span>
                  </div>
                </>
              )}
            </div>
            
            <button 
              className="toggle-nutrients-button"
              onClick={() => setShowAllNutrients(!showAllNutrients)}
            >
              {showAllNutrients ? 'Show Less' : 'Show All Nutrients'}
            </button>
          </section>

          {/* LLM Settings Section (moved to bottom) */}
          <section className="settings-section">
            <h3 className="section-title">LLM Settings (AI Analysis)</h3>
            <p style={{ color: '#ccc', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Configure local LLM (Ollama) for AI food analysis. The LLM runs on your device for privacy and offline use.
            </p>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="ollamaUrl">Ollama URL</label>
                <input
                  type="text"
                  id="ollamaUrl"
                  value={llmConfig.ollamaUrl}
                  onChange={(e) => setLlmConfig({ ...llmConfig, ollamaUrl: e.target.value })}
                  disabled={!isEditing}
                  placeholder="http://localhost:11434"
                />
                <small style={{ color: '#999' }}>Default: http://localhost:11434</small>
              </div>

              <div className="form-group">
                <label htmlFor="model">Model</label>
                <select
                  id="model"
                  value={llmConfig.model}
                  onChange={(e) => setLlmConfig({ ...llmConfig, model: e.target.value })}
                  disabled={!isEditing || !ollamaStatus?.available}
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
                <small style={{ color: '#999' }}>
                  {ollamaStatus?.available 
                    ? `${ollamaStatus.models?.length || 0} model(s) available` 
                    : 'Check Ollama status to see available models'}
                </small>
              </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button 
                className="check-ollama-button"
                onClick={handleCheckOllama}
                disabled={checkingOllama}
              >
                {checkingOllama ? '⏳ Checking...' : '🔍 Check Ollama Status'}
              </button>
              <a 
                href="https://ollama.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ollama-link"
                style={{ color: '#646cff', textDecoration: 'none', fontSize: '0.9rem' }}
              >
                📥 Download Ollama
              </a>
            </div>

            {ollamaStatus && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#1a2a1a', border: `1px solid ${ollamaStatus.available ? '#10b981' : '#dc2626'}`, borderRadius: '6px' }}>
                <p style={{ margin: '0 0 0.5rem 0', color: ollamaStatus.available ? '#10b981' : '#dc2626' }}>
                  {ollamaStatus.available ? '✅ Ollama is running!' : '❌ Ollama is not available'}
                </p>
                {ollamaStatus.available && ollamaStatus.models && ollamaStatus.models.length > 0 && (
                  <p style={{ margin: '0.5rem 0 0 0', color: '#ccc', fontSize: '0.9rem' }}>
                    Available models: {ollamaStatus.models.map(m => m.name || m).join(', ')}
                  </p>
                )}
                {!ollamaStatus.available && (
                  <p style={{ margin: '0.5rem 0 0 0', color: '#ccc', fontSize: '0.9rem' }}>
                    {ollamaStatus.error || 'Could not connect to Ollama'}
                  </p>
                )}
              </div>
            )}

            <div className="info-card">
              <div className="info-icon">ℹ️</div>
              <div className="info-content">
                <h4>Setting Up Ollama</h4>
                <ol style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem', color: '#ccc', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  <li>Download Ollama from <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" style={{ color: '#646cff' }}>ollama.ai</a></li>
                  <li>Install and run Ollama (it starts automatically on port 11434)</li>
                  <li>Pull a model: <code style={{ background: '#0a0a0a', padding: '0.25rem 0.5rem', borderRadius: '3px', color: '#10b981' }}>ollama pull mistral</code></li>
                  <li>Come back here and click "Check Ollama Status"</li>
                  <li>Use "Analyze with Local AI" in the Food Library tab</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Info Card */}
          <div className="info-card">
            <div className="info-icon">ℹ️</div>
            <div className="info-content">
              <h4>About Your Settings</h4>
              <p>
                Your activity level and calorie goal help determine your daily
                nutrient targets. Changes to these settings will automatically
                update your personalized recommendations shown above.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation Update Modal */}
      {showRecommendationModal && (
        <div 
          className="modal-overlay" 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowRecommendationModal(false)}
        >
          <div 
            className="modal-content"
            style={{
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#fff' }}>
              Choose Recommendation Method
            </h3>
            <p style={{ color: '#ccc', marginBottom: '2rem', lineHeight: '1.6' }}>
              Select how you'd like to update your daily nutrient recommendations:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button
                onClick={updateWithFormula}
                disabled={updatingRecommendations}
                style={{
                  padding: '1.25rem',
                  background: '#2a2a2a',
                  border: '2px solid #4CAF50',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: updatingRecommendations ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  opacity: updatingRecommendations ? 0.6 : 1
                }}
                onMouseOver={(e) => !updatingRecommendations && (e.currentTarget.style.background = '#333')}
                onMouseOut={(e) => !updatingRecommendations && (e.currentTarget.style.background = '#2a2a2a')}
              >
                <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  📊 Standard Formula
                </div>
                <div style={{ fontSize: '0.85rem', color: '#aaa' }}>
                  Uses evidence-based nutritional guidelines (RDA/DRI) tailored to your age, gender, and activity level. Fast and reliable.
                </div>
              </button>

              <button
                onClick={updateWithAI}
                disabled={updatingRecommendations || !ollamaStatus?.available}
                style={{
                  padding: '1.25rem',
                  background: '#2a2a2a',
                  border: `2px solid ${ollamaStatus?.available ? '#667eea' : '#666'}`,
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: (updatingRecommendations || !ollamaStatus?.available) ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  opacity: (updatingRecommendations || !ollamaStatus?.available) ? 0.6 : 1
                }}
                onMouseOver={(e) => !updatingRecommendations && ollamaStatus?.available && (e.currentTarget.style.background = '#333')}
                onMouseOut={(e) => !updatingRecommendations && ollamaStatus?.available && (e.currentTarget.style.background = '#2a2a2a')}
              >
                <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  🤖 AI Personalized {!ollamaStatus?.available && '(Setup Required)'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#aaa' }}>
                  {ollamaStatus?.available 
                    ? 'Uses local AI to generate deeply personalized recommendations based on your unique profile. May take 30-60 seconds.'
                    : 'Requires Ollama to be installed and running. Configure in LLM Settings below.'}
                </div>
              </button>
            </div>

            {updatingRecommendations && (
              <div style={{ marginTop: '1.5rem', textAlign: 'center', color: '#667eea' }}>
                <span style={{ fontSize: '1.5rem' }}>⏳</span>
                <p style={{ margin: '0.5rem 0 0 0' }}>Updating recommendations...</p>
              </div>
            )}

            <button
              onClick={() => setShowRecommendationModal(false)}
              disabled={updatingRecommendations}
              style={{
                marginTop: '1.5rem',
                width: '100%',
                padding: '0.75rem',
                background: 'transparent',
                border: '1px solid #444',
                borderRadius: '6px',
                color: '#ccc',
                cursor: updatingRecommendations ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTab;
