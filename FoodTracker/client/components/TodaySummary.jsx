import React, { useState } from 'react';
import CalorieDonut from './CalorieDonut';
import MacroDonuts from './MacroDonuts';
import MicroBars from './MicroBars';

const TodaySummary = ({ todayData, needToday }) => {
  const [showAllMicros, setShowAllMicros] = useState(false);

  if (!todayData || !needToday) {
    return (
      <div className="today-summary-right">
        <div className="loading-message">Loading nutrient data...</div>
      </div>
    );
  }

  // Ensure we have valid data structures
  const currentNutrients = todayData.nutrients || {};
  const currentCalories = todayData.calories || 0;
  const targetCalories = needToday.Calories_kcal || 0;

  // Calculate calorie progress for encouragement
  const calorieProgress = targetCalories > 0 ? (currentCalories / targetCalories) * 100 : 0;
  const getEncouragementMessage = () => {
    if (calorieProgress >= 90 && calorieProgress <= 110) {
      return "🔥 Great job! You're right on target!";
    } else if (calorieProgress < 50) {
      return "🥗 Keep going! You're building momentum.";
    } else if (calorieProgress > 120) {
      return "⚖️ You're doing great! Consider your energy balance.";
    } else {
      return "💪 You're making solid progress today!";
    }
  };

  return (
    <div className="today-summary-right">
      <div className="nutrient-visualization">
        {/* Header with encouragement */}
        <div className="summary-header">
          <h2 className="summary-title">Today's Progress</h2>
          <p className="encouragement-message">{getEncouragementMessage()}</p>
        </div>

        {/* Calorie Overview - Main Focus */}
        <div className="calorie-overview">
          <CalorieDonut 
            current={currentCalories} 
            target={targetCalories}
            className="main-calorie-donut"
          />
        </div>

        {/* Macro Breakdown - Clean Row */}
        <div className="macro-breakdown">
          <MacroDonuts 
            nutrients={currentNutrients} 
            targets={needToday}
          />
        </div>

        {/* Key Micronutrients - Compact & Smart */}
        <div className="micro-overview">
          <MicroBars 
            nutrients={currentNutrients} 
            targets={needToday}
            showAll={showAllMicros}
            onToggleShowAll={() => setShowAllMicros(!showAllMicros)}
          />
        </div>
      </div>
    </div>
  );
};

export default TodaySummary;
