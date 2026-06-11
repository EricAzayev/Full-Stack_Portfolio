import React, { useState, useEffect } from 'react'
import TodaySummary from './TodaySummary'
import SmartRecommendations from './SmartRecommendations'
import { apiUrl } from '../services/api'

const TodayTab = ({ onNavigateToFoodLibrary, onNavigateToUserSettings }) => {
  const [foodLibrary, setFoodLibrary] = useState({})
  const [todayData, setTodayData] = useState({})
  const [needToday, setNeedToday] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [servings, setServings] = useState(1)
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const hasUserSettings = Object.keys(needToday).length > 0
  const hasFoodLibrary = Object.keys(foodLibrary).length > 0
  const showSetupGuide = !hasUserSettings || !hasFoodLibrary

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [foodLibraryRes, todayRes] = await Promise.all([
          fetch(apiUrl('/api/foodLibrary')),
          fetch(apiUrl('/api/today'))
        ])

        const foodLibraryData = await foodLibraryRes.json()
        const todayResponse = await todayRes.json()

        console.log("📅 [TodayTab] Fetched today data:", todayResponse);
        console.log("📅 [TodayTab] Setting todayData to:", todayResponse.today);

        // Data loaded successfully
        setFoodLibrary(foodLibraryData)
        setTodayData(todayResponse.today)
        setNeedToday(todayResponse.needToday)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  // Handle search input
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)

    if (value.length > 0 && Object.keys(foodLibrary).length > 0) {
      const results = Object.keys(foodLibrary).filter(food =>
        food.toLowerCase().includes(value.toLowerCase())
      )
      setSearchResults(results)
      setShowResults(true)
    } else {
      setSearchResults([])
      setShowResults(false)
    }
  }

  // Handle food selection
  const handleFoodSelect = (foodName) => {
    setSearchTerm(foodName)
    setShowResults(false)
  }

  // Handle adding food to today's intake
  const handleAddFood = async (foodName = null, servingsAmount = null) => {
    // Check if foodName is actually a string (not an event object)
    const food = (typeof foodName === 'string' && foodName) ? foodName : searchTerm;
    const amount = (typeof servingsAmount === 'number' && servingsAmount) ? servingsAmount : servings;

    if (!food || !foodLibrary[food]) {
      alert('Please select a valid food from the search results')
      return
    }

    try {
      const response = await fetch(apiUrl('/api/today'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          foodName: food,
          servings: amount,
          mode: 'add' // Add servings (delta)
        })
      })

      if (response.ok) {
        const result = await response.json()

        // Update local state with the new data
        setTodayData(result.today)
        setNeedToday(result.needToday)

        // Show success message
        setSuccessMessage(`✓ Added ${amount} serving(s) of ${food} to today's intake!`)

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000)

        // Reset form only if using the search interface
        if (!foodName) {
          setSearchTerm('')
          setServings(1)
        }
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error adding food:', error)
      alert('Error adding food. Please try again.')
    }
  }

  // Handle updating food quantity
  const handleUpdateQuantity = async (foodName, newQuantity) => {
    if (newQuantity < 0) return

    try {
      const response = await fetch(apiUrl('/api/today'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          foodName: foodName,
          servings: newQuantity,
          mode: 'set' // Set absolute servings
        })
      })

      if (response.ok) {
        const result = await response.json()

        // Update local state with the new data
        setTodayData(result.today)
        setNeedToday(result.needToday)

        // Show success message
        if (newQuantity === 0) {
          setSuccessMessage(`✓ Removed ${foodName} from today's intake!`)
        } else {
          setSuccessMessage(`✓ Updated ${foodName} to ${newQuantity} serving${newQuantity !== 1 ? 's' : ''}!`)
        }

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating food quantity:', error)
      alert('Error updating food quantity. Please try again.')
    }
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (showResults && searchResults.length > 0) {
        handleFoodSelect(searchResults[0])
      } else {
        handleAddFood()
      }
    } else if (e.key === 'Escape') {
      setShowResults(false)
    } else if (e.key === 'ArrowDown' && showResults) {
      e.preventDefault()
      // TODO: Implement arrow key navigation
    } else if (e.key === 'ArrowUp' && showResults) {
      e.preventDefault()
      // TODO: Implement arrow key navigation
    }
  }

  return (
    <div className="today-tab">
      <div className="left-panel">
        {showSetupGuide && (
          <div className="setup-guide-card">
            <div className="setup-guide-header">
              <h2>Start Here</h2>
              <p>Set up these two tabs once and the rest of FoodTracker becomes useful immediately.</p>
            </div>
            <div className="setup-guide-steps">
              <button className="setup-step" onClick={onNavigateToUserSettings}>
                <span className="setup-step-icon" aria-hidden="true">👤</span>
                <span className="setup-step-copy">
                  <strong>1. User Settings</strong>
                  <span>{hasUserSettings ? 'Profile is ready.' : 'Add your profile so calorie and nutrient targets can be calculated.'}</span>
                </span>
              </button>
              <button className="setup-step" onClick={onNavigateToFoodLibrary}>
                <span className="setup-step-icon" aria-hidden="true">📚</span>
                <span className="setup-step-copy">
                  <strong>2. Food Library</strong>
                  <span>{hasFoodLibrary ? 'Food library has items.' : 'Add foods here so Today and Recommendations have something to work with.'}</span>
                </span>
              </button>
            </div>
          </div>
        )}

        <div className="food-input-section">
          <h2>Add Food to Today's Intake</h2>

          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}

          <div className="input-group">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search for food..."
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                className="search-input"
              />

              {showResults && searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((food, index) => (
                    <div
                      key={food}
                      className="search-result-item"
                      onClick={() => handleFoodSelect(food)}
                    >
                      {food}
                    </div>
                  ))}
                </div>
              )}
              {searchTerm.length > 0 && searchResults.length === 0 && Object.keys(foodLibrary).length > 0 && (
                <div className="search-results">
                  <div className="search-result-item no-results">
                    No foods found matching "{searchTerm}".{' '}
                    <span 
                      className="add-food-link" 
                      onClick={onNavigateToFoodLibrary}
                      style={{ cursor: 'pointer', color: '#4CAF50', fontWeight: 'bold', textDecoration: 'underline' }}
                    >
                      Add it here!
                    </span>
                  </div>
                </div>
              )}
            </div>

            <input
              type="number"
              min="1"
              value={servings}
              onChange={(e) => setServings(parseInt(e.target.value) || 1)}
              className="servings-input"
              placeholder="Servings"
            />

            <button
              onClick={handleAddFood}
              className="add-button"
              disabled={!searchTerm || !foodLibrary[searchTerm]}
            >
              Add
            </button>
          </div>
        </div>

        <div className="foods-eaten-section">
          <h3>Foods Eaten Today</h3>
          {todayData.food && Object.keys(todayData.food).length > 0 ? (
            <div className="food-list">
              {Object.entries(todayData.food).map(([foodName, servings]) => (
                <div key={foodName} className="food-item">
                  <div className="food-info">
                    <span className="food-name">{foodName}</span>
                    <span className="food-servings">{servings} serving{servings !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="quantity-controls">
                    <button
                      className="quantity-btn decrease-btn"
                      onClick={() => handleUpdateQuantity(foodName, servings - 1)}
                      title="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="quantity-display">{servings}</span>
                    <button
                      className="quantity-btn increase-btn"
                      onClick={() => handleUpdateQuantity(foodName, servings + 1)}
                      title="Increase quantity"
                    >
                      +
                    </button>
                    {servings > 0 && (
                      <button
                        className="quantity-btn remove-btn"
                        onClick={() => handleUpdateQuantity(foodName, 0)}
                        title="Remove food"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-foods">No foods added yet today</p>
          )}
        </div>

        <SmartRecommendations
          todayData={todayData}
          needToday={needToday}
          onAddFood={handleAddFood}
          foodLibraryCount={Object.keys(foodLibrary).length}
          onNavigateToFoodLibrary={onNavigateToFoodLibrary}
          onNavigateToUserSettings={onNavigateToUserSettings}
        />

      </div>

      <div className="right-panel">
        <TodaySummary todayData={todayData} needToday={needToday} />
      </div>
    </div>
  )
}

export default TodayTab
