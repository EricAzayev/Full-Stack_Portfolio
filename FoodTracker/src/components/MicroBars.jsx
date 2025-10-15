import React, { useState } from 'react';

const MicroBars = ({ nutrients, targets, showAll = false, onToggleShowAll }) => {
  const [hoveredNutrient, setHoveredNutrient] = useState(null);

  // Define micronutrients with their colors, units, and icons
  const micronutrients = [
    { key: 'Omega3_DHA_EPA_mg', name: 'Omega-3', color: '#10b981', unit: 'mg', icon: '🐟' },
    { key: 'Vitamin_B12_mcg', name: 'Vitamin B12', color: '#8b5cf6', unit: 'μg', icon: '🥚' },
    { key: 'Choline_mg', name: 'Choline', color: '#f59e0b', unit: 'mg', icon: '🧠' },
    { key: 'Magnesium_mg', name: 'Magnesium', color: '#06b6d4', unit: 'mg', icon: '🦴' },
    { key: 'Iron_mg', name: 'Iron', color: '#ef4444', unit: 'mg', icon: '💪' },
    { key: 'Zinc_mg', name: 'Zinc', color: '#84cc16', unit: 'mg', icon: '🛡️' },
    { key: 'Calcium_mg', name: 'Calcium', color: '#f97316', unit: 'mg', icon: '🦴' },
    { key: 'Vitamin_D_mcg', name: 'Vitamin D', color: '#ec4899', unit: 'μg', icon: '☀️' },
    { key: 'Vitamin_C_mg', name: 'Vitamin C', color: '#22c55e', unit: 'mg', icon: '🍊' },
    { key: 'Fiber_g', name: 'Fiber', color: '#a855f7', unit: 'g', icon: '🌾' },
    { key: 'Collagen_g', name: 'Collagen', color: '#64748b', unit: 'g', icon: '💎' }
  ];

  // Calculate progress for each nutrient and sort by deficiency (lowest % first)
  const nutrientsWithProgress = micronutrients
    .map(nutrient => {
      const current = nutrients[nutrient.key] || 0;
      const target = targets[nutrient.key] || 0;
      const percentage = target > 0 ? Math.min((current / target) * 100, 150) : 0;
      return { ...nutrient, current, target, percentage };
    })
    .filter(nutrient => nutrient.target > 0) // Only show nutrients with targets
    .sort((a, b) => a.percentage - b.percentage); // Sort by deficiency (lowest first)

  // Show top 5 most deficient by default, or all if showAll is true
  const displayNutrients = showAll ? nutrientsWithProgress : nutrientsWithProgress.slice(0, 5);

  const getProgressColor = (percent) => {
    if (percent < 50) return '#ff6b6b'; // red/orange for low
    if (percent < 90) return '#ffd93d'; // yellow for moderate
    if (percent <= 110) return '#6bcf7f'; // green for ideal
    return '#8b9dc3'; // gray/blue for excess
  };

  const getEncouragementMessage = (nutrient) => {
    if (nutrient.percentage < 30) {
      return `🥦 You're low on ${nutrient.name} — maybe add some ${nutrient.name === 'Vitamin D' ? 'salmon or eggs' : 'leafy greens'}?`;
    } else if (nutrient.percentage < 70) {
      return `💪 Keep building your ${nutrient.name} intake!`;
    } else if (nutrient.percentage >= 90) {
      return `🎉 Great job on ${nutrient.name}!`;
    }
    return '';
  };

  return (
    <div className="micro-bars">
      <div className="micro-bars-header">
        <h3 className="micro-bars-title">Key Nutrients</h3>
        {nutrientsWithProgress.length > 5 && (
          <button 
            className="toggle-micros-button"
            onClick={onToggleShowAll}
          >
            {showAll ? 'Show Less' : `Show All (${nutrientsWithProgress.length})`}
          </button>
        )}
      </div>
      
      <div className="micro-bars-container">
        {displayNutrients.map((nutrient) => {
          const progressColor = getProgressColor(nutrient.percentage);
          const isHovered = hoveredNutrient === nutrient.key;
          const encouragement = getEncouragementMessage(nutrient);

          return (
            <div
              key={nutrient.key}
              className={`micro-bar-item ${isHovered ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredNutrient(nutrient.key)}
              onMouseLeave={() => setHoveredNutrient(null)}
            >
              <div className="micro-bar-header">
                <div className="micro-bar-icon-name">
                  <span className="micro-bar-icon">{nutrient.icon}</span>
                  <div className="micro-bar-name" style={{ color: nutrient.color }}>
                    {nutrient.name}
                  </div>
                </div>
                <div className="micro-bar-values">
                  <span className="micro-bar-current">{Math.round(nutrient.current * 10) / 10}{nutrient.unit}</span>
                  <span className="micro-bar-separator">/</span>
                  <span className="micro-bar-target">{nutrient.target}{nutrient.unit}</span>
                  <span className="micro-bar-percentage">{Math.round(nutrient.percentage)}%</span>
                </div>
              </div>
              
              <div className="micro-bar-track">
                <div
                  className="micro-bar-fill"
                  style={{
                    width: `${Math.min(nutrient.percentage, 100)}%`,
                    backgroundColor: progressColor,
                    transition: 'width 0.8s ease-in-out, background-color 0.3s ease'
                  }}
                />
                {nutrient.percentage > 100 && (
                  <div
                    className="micro-bar-excess"
                    style={{
                      width: `${Math.min(nutrient.percentage - 100, 50)}%`,
                      backgroundColor: '#8b9dc3'
                    }}
                  />
                )}
              </div>
              
              {isHovered && encouragement && (
                <div className="micro-bar-encouragement">
                  {encouragement}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MicroBars;
