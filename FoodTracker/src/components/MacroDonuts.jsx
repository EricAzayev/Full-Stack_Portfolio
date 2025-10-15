import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const MacroDonuts = ({ nutrients, targets }) => {
  const macros = [
    { key: 'Protein_g', name: 'Protein', color: '#3b82f6', unit: 'g' },
    { key: 'Carbohydrates_g', name: 'Carbs', color: '#f97316', unit: 'g' },
    { key: 'Fats_g', name: 'Fats', color: '#eab308', unit: 'g' }
  ];

  const getColor = (percent) => {
    if (percent < 50) return '#ff6b6b'; // red/orange for low
    if (percent < 90) return '#ffd93d'; // yellow for moderate
    if (percent <= 110) return '#6bcf7f'; // green for ideal
    return '#8b9dc3'; // gray/blue for excess
  };

  return (
    <div className="macro-donuts">
      {macros.map((macro) => {
        const current = nutrients[macro.key] || 0;
        const target = targets[macro.key] || 0;
        const percentage = target > 0 ? Math.min((current / target) * 100, 150) : 0;
        const color = getColor(percentage);

        return (
          <div key={macro.key} className="macro-donut-item">
            <div className="macro-donut-container">
              <CircularProgressbar
                value={percentage}
                text={`${Math.round(current)}`}
                styles={buildStyles({
                  pathColor: color,
                  textColor: '#fff',
                  trailColor: '#333',
                  backgroundColor: '#1a1a1a',
                  textSize: '16px',
                  fontWeight: 'bold'
                })}
              />
            </div>
            <div className="macro-donut-label">
              <div className="macro-donut-name">{macro.name}</div>
              <div className="macro-donut-target">{target}{macro.unit}</div>
              <div className="macro-donut-percentage">{Math.round(percentage)}%</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MacroDonuts;
