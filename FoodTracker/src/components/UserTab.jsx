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

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
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
        setSaveMessage("Settings saved successfully!");
        setIsEditing(false);
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

          {/* Info Card */}
          <div className="info-card">
            <div className="info-icon">ℹ️</div>
            <div className="info-content">
              <h4>About Your Settings</h4>
              <p>
                Your activity level and calorie goal help determine your daily
                nutrient targets. Changes to these settings will affect the
                recommended values shown in the Today tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTab;
