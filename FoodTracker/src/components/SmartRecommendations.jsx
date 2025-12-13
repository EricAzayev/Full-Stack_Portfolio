import React, { useState, useEffect } from 'react';

const SmartRecommendations = ({ todayData, needToday, onAddFood }) => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, [todayData, needToday]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/smart-recommendations');
      
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      } else {
        setError('Failed to load recommendations');
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFood = (foodName) => {
    onAddFood(foodName, 1);
    setTimeout(() => fetchRecommendations(), 500);
  };

  if (loading) {
    return (
      <div className="smart-recommendations">
        <h3>🎯 Food Recommendations</h3>
        <div className="loading-message">Analyzing your nutrient intake...</div>
      </div>
    );
  }

  if (error || !recommendations) {
    return (
      <div className="smart-recommendations">
        <h3>🎯 Food Recommendations</h3>
        <div className="error-message">
          <p>{error || 'No recommendations available'}</p>
          <button onClick={fetchRecommendations} className="retry-btn">Try Again</button>
        </div>
      </div>
    );
  }

  const { remainingCalories, nutrientGaps, recommendations: foods } = recommendations;

  if (foods.length === 0) {
    return (
      <div className="smart-recommendations">
        <h3>🎯 Food Recommendations</h3>
        <div className="empty-message">
          <p>✨ {remainingCalories < 100 ? "You're close to your calorie goal!" : "All nutrient targets met!"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="smart-recommendations">
      <div className="rec-header-section">
        <h3>🎯 Food Recommendations</h3>
        <div className="rec-subtitle">
          Based on your nutrient gaps • {Math.round(remainingCalories)} calories remaining
        </div>
      </div>

      {nutrientGaps && nutrientGaps.length > 0 && (
        <div className="nutrient-gaps">
          <h4>What You Need</h4>
          <div className="gaps-grid">
            {nutrientGaps.map((gap, index) => (
              <div key={index} className="gap-badge">
                <span className="gap-name">{gap.nutrient}</span>
                <span className="gap-percent">{gap.percentMet}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="food-recommendations">
        <h4>Recommended Foods</h4>
        {foods.map((food, index) => (
          <div key={index} className="food-rec-card">
            <div className="food-rec-main">
              <div className="food-rec-info">
                <div className="food-rec-name">{food.foodName}</div>
                {food.topFills && food.topFills.length > 0 && (
                  <div className="food-rec-fills">
                    {food.topFills.map((fill, idx) => (
                      <div key={idx} className="fill-item">
                        <span className="fill-nutrient">{fill.nutrient}:</span>
                        <span className="fill-impact">+{fill.percentOfDailyNeed}% of daily need</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="food-rec-meta">
                  {food.calories} cal • {food.servingSize}g serving • {food.category}
                </div>
              </div>
              <button 
                className="add-food-btn"
                onClick={() => handleAddFood(food.foodName)}
                title="Add to today"
              >
                + Add
              </button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={fetchRecommendations} className="refresh-rec-btn">
        🔄 Refresh
      </button>
    </div>
  );
};

export default SmartRecommendations;
