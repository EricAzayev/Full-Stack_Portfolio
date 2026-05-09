import React, { useState, useEffect } from "react";

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
  const [recommendations, setRecommendations] = useState({});
  const [showAllNutrients, setShowAllNutrients] = useState(false);
  const [llmSettings, setLlmSettings] = useState({
    ollamaUrl: 'http://localhost:11434',
    model: 'mistral:latest',
    enabled: true,
  });
  const [ollamaStatus, setOllamaStatus] = useState(null);
  const [checkingOllama, setCheckingOllama] = useState(false);

  // Fetch user data and recommendations on component mount
  useEffect(() => {
    fetchUserData();
    fetchRecommendations();
    loadLlmSettings();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/user");
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setSaveMessage("Failed to load user data");
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/recommendations");
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

  const loadLlmSettings = () => {
    try {
      const saved = localStorage.getItem('llmSettings');
      if (saved) {
        setLlmSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading LLM settings:', error);
    }
  };

  const saveLlmSettings = (newSettings) => {
    try {
      localStorage.setItem('llmSettings', JSON.stringify(newSettings));
      setLlmSettings(newSettings);
    } catch (error) {
      console.error('Error saving LLM settings:', error);
    }
  };

  const checkOllamaStatus = async () => {
    setCheckingOllama(true);
    try {
      const response = await fetch(`http://localhost:3001/api/ai/check-ollama?url=${encodeURIComponent(llmSettings.ollamaUrl)}`);
      const data = await response.json();
      setOllamaStatus(data);
    } catch (error) {
      console.error('Error checking Ollama status:', error);
      setOllamaStatus({
        available: false,
        error: error.message,
      });
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

    if (!userData.height || userData.height < 50 || userData.height > 300) {
      newErrors.height = "Please enter a valid height in cm (50-300)";
    }

    if (!userData.weight || userData.weight < 20 || userData.weight > 500) {
      newErrors.weight = "Please enter a valid weight in kg (20-500)";
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
      const response = await fetch("http://localhost:3001/api/user", {
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
        // Update recommendations with the fresh data returned from the server
        setRecommendations(result.recommendations);
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
            <h3 className="section-title">Physical Measurements</h3>
            <div className="form-grid">
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
                  className={errors.weight ? "input-error" : ""}
                />
                {errors.weight && (
                  <span className="error-text">{errors.weight}</span>
                )}
              </div>

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
            <h3 className="section-title">Daily Recommendations</h3>
            <p style={{ color: '#ccc', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Your personalized daily nutrient targets based on your profile settings.
            </p>
            
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
                  value={llmSettings.ollamaUrl}
                  onChange={(e) => saveLlmSettings({ ...llmSettings, ollamaUrl: e.target.value })}
                  disabled={!isEditing}
                  placeholder="http://localhost:11434"
                />
                <small style={{ color: '#999' }}>Default: http://localhost:11434</small>
              </div>

              <div className="form-group">
                <label htmlFor="model">Model</label>
                <input
                  type="text"
                  id="model"
                  value={llmSettings.model}
                  onChange={(e) => saveLlmSettings({ ...llmSettings, model: e.target.value })}
                  disabled={!isEditing}
                  placeholder="mistral:latest"
                />
                <small style={{ color: '#999' }}>E.g., mistral:latest, phi:latest, tinyllama:latest</small>
              </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button 
                className="check-ollama-button"
                onClick={checkOllamaStatus}
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
    </div>
  );
};

export default UserTab;
