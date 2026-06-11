import React, { useState, useEffect } from 'react';
import { apiUrl } from '../services/api';

const SmartRecommendations = ({
  todayData,
  needToday,
  onAddFood,
  foodLibraryCount,
  onNavigateToFoodLibrary,
  onNavigateToUserSettings,
}) => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const hasUserSettings = Object.keys(needToday || {}).length > 0;
  const hasFoodLibrary = foodLibraryCount > 0;
  const hasFoodsToday = Boolean(todayData?.food && Object.keys(todayData.food).length > 0);

  useEffect(() => {
    if (!hasUserSettings || !hasFoodLibrary) {
      setRecommendations(null);
      setError(null);
      setLoading(false);
      return;
    }

    fetchRecommendations();
  }, [todayData, needToday, hasUserSettings, hasFoodLibrary]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(apiUrl('/api/smart-recommendations'));
      
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      } else {
        const payload = await response.json().catch(() => null);
        setRecommendations(null);
        setError(payload?.error || 'Failed to load recommendations');
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setRecommendations(null);
      setError('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFood = (foodName) => {
    onAddFood(foodName, 1);
    setTimeout(() => fetchRecommendations(), 500);
  };

  const renderSetupState = ({ icon, title, message, actionLabel, onAction }) => (
    <div className="smart-recommendations empty-state-card">
      <h3>🎯 Food Recommendations</h3>
      <div className="setup-state-body">
        <div className="setup-state-icon" aria-hidden="true">{icon}</div>
        <div className="setup-state-copy">
          <h4>{title}</h4>
          <p>{message}</p>
        </div>
      </div>
      {onAction && (
        <button onClick={onAction} className="retry-btn cta-btn">
          {actionLabel}
        </button>
      )}
    </div>
  );

  if (!hasUserSettings) {
    return renderSetupState({
      icon: '👤',
      title: 'User Settings not set up',
      message: 'Add your profile first so FoodTracker can calculate calorie and nutrient targets before recommending foods.',
      actionLabel: 'Open User Settings',
      onAction: onNavigateToUserSettings,
    });
  }

  if (!hasFoodLibrary) {
    return renderSetupState({
      icon: '📚',
      title: 'Your food library is empty',
      message: 'Add a few foods to your library and FoodTracker will suggest what best fills today\'s nutrient gaps.',
      actionLabel: 'Open Food Library',
      onAction: onNavigateToFoodLibrary,
    });
  }

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
          <p>{error || 'No recommendations available right now.'}</p>
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
          <p>
            ✨ {remainingCalories < 100
              ? "You're close to your calorie goal for today."
              : hasFoodsToday
                ? 'You are in good shape so far. Add more foods if you want more specific suggestions.'
                : 'Start logging foods today and this section will suggest the best next additions.'}
          </p>
        </div>
      </div>
    );
  }

  // Get unique categories from recommendations
  const categories = ['All', ...new Set(foods.map(f => f.category).filter(c => c))];
  
  // Filter foods by active category
  const filteredFoods = activeCategory === 'All' 
    ? foods 
    : foods.filter(f => f.category === activeCategory);

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

      <div className="category-tabs">
        {categories.map(category => (
          <button
            key={category}
            className={`category-tab ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="food-recommendations">
        <h4>Recommended Foods</h4>
        {filteredFoods.map((food, index) => (
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
