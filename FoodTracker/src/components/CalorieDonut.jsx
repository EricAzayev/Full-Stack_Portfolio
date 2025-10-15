import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const CalorieDonut = ({ current, target, className = '' }) => {
  const percentage = target > 0 ? Math.min((current / target) * 100, 150) : 0;
  
  // Dynamic color based on progress
  const getColor = (percent) => {
    if (percent < 50) return '#ff6b6b'; // red/orange for low
    if (percent < 90) return '#ffd93d'; // yellow for moderate
    if (percent <= 110) return '#6bcf7f'; // green for ideal
    return '#8b9dc3'; // gray/blue for excess
  };

  const color = getColor(percentage);

  return (
    <div className={`calorie-donut ${className}`}>
      <div className="calorie-donut-container">
        <CircularProgressbar
          value={percentage}
          text={`${Math.round(current)}`}
          styles={buildStyles({
            pathColor: color,
            textColor: '#fff',
            trailColor: '#333',
            backgroundColor: '#1a1a1a',
            textSize: '24px',
            fontWeight: 'bold'
          })}
        />
      </div>
      <div className="calorie-donut-info">
        <div className="calorie-donut-title">Calories</div>
        <div className="calorie-donut-target">of {target} goal</div>
        <div className="calorie-donut-percentage">{Math.round(percentage)}%</div>
      </div>
    </div>
  );
};

export default CalorieDonut;
