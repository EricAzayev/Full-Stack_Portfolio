import React, { useState, useEffect } from 'react'

const AnalyticsTab = ({ onDateClick }) => {
  const [records, setRecords] = useState([])
  const [timeRange, setTimeRange] = useState('week') // 'week' or 'month'
  const [user, setUser] = useState(null)
  const [recommendations, setRecommendations] = useState(null)
  const [showAllNutrients, setShowAllNutrients] = useState(false)

  // Fetch historical records and user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recordRes, userRes, recRes] = await Promise.all([
          fetch('http://localhost:3001/api/records'),
          fetch('http://localhost:3001/api/user'),
          fetch('http://localhost:3001/api/recommendations')
        ])
        
        const recordData = await recordRes.json()
        const userData = await userRes.json()
        const recData = await recRes.json()
        
        setRecords(recordData.records || [])
        setUser(userData)
        setRecommendations(recData)
      } catch (error) {
        console.error('Error fetching analytics data:', error)
      }
    }

    fetchData()
  }, [])

  // Calculate date range based on timeRange
  const getDateRange = () => {
    const now = new Date()
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    let startDate

    if (timeRange === 'week') {
      startDate = new Date(endDate)
      startDate.setDate(startDate.getDate() - 6) // Last 7 days
    } else {
      startDate = new Date(endDate)
      startDate.setDate(startDate.getDate() - 29) // Last 30 days
    }

    return { startDate, endDate }
  }

  // Filter records within date range
  const getRecordsInRange = () => {
    const { startDate, endDate } = getDateRange()
    return records.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate >= startDate && recordDate <= endDate
    }).sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  // Calculate statistics
  const calculateStats = () => {
    const rangeRecords = getRecordsInRange()
    
    if (rangeRecords.length === 0) {
      return {
        avgCalories: 0,
        avgProtein: 0,
        avgCarbs: 0,
        avgFats: 0,
        totalDays: 0,
        bestDay: null,
        worstDay: null
      }
    }

    const totalCalories = rangeRecords.reduce((sum, r) => sum + (r.calories || 0), 0)
    const totalProtein = rangeRecords.reduce((sum, r) => sum + (r.nutrients?.Protein_g || 0), 0)
    const totalCarbs = rangeRecords.reduce((sum, r) => sum + (r.nutrients?.Carbohydrates_g || 0), 0)
    const totalFats = rangeRecords.reduce((sum, r) => sum + (r.nutrients?.Fats_g || 0), 0)

    // Find best/worst days based on calorie goal
    const calorieGoal = user?.calorieGoal || 2000
    const sortedByGoalProximity = [...rangeRecords].sort((a, b) => {
      const diffA = Math.abs((a.calories || 0) - calorieGoal)
      const diffB = Math.abs((b.calories || 0) - calorieGoal)
      return diffA - diffB
    })

    const sortedByCalories = [...rangeRecords].sort((a, b) => (b.calories || 0) - (a.calories || 0))

    return {
      avgCalories: totalCalories / rangeRecords.length,
      avgProtein: totalProtein / rangeRecords.length,
      avgCarbs: totalCarbs / rangeRecords.length,
      avgFats: totalFats / rangeRecords.length,
      totalDays: rangeRecords.length,
      bestDay: sortedByGoalProximity[0], // Closest to goal
      worstDay: sortedByCalories[sortedByCalories.length - 1], // Lowest calories
      highestDay: sortedByCalories[0] // Highest calories
    }
  }

  const stats = calculateStats()
  const rangeRecords = getRecordsInRange()

  // Handle clicking on a day in analytics to navigate to History
  const handleDayClick = (dateString) => {
    if (onDateClick) {
      onDateClick(dateString)
    }
  }

  // Render calorie trend chart (simple bar chart)
  const renderCalorieChart = () => {
    if (rangeRecords.length === 0) {
      return <div className="chart-empty">No data to display</div>
    }

    const maxCalories = Math.max(...rangeRecords.map(r => r.calories || 0), user?.calorieGoal || 2000)
    const calorieGoal = user?.calorieGoal || 2000

    return (
      <div className="calorie-chart">
        <div className="chart-y-axis">
          <span>{maxCalories}</span>
          <span>{Math.floor(maxCalories / 2)}</span>
          <span>0</span>
        </div>
        <div className="chart-bars">
          {rangeRecords.map(record => {
            const height = ((record.calories || 0) / maxCalories) * 100
            const isAboveGoal = (record.calories || 0) > calorieGoal
            const isBelowGoal = (record.calories || 0) < calorieGoal * 0.8

            return (
              <div
                key={record.date}
                className="chart-bar-container"
                onClick={() => handleDayClick(record.date)}
                title={`${record.date}: ${record.calories} cal`}
              >
                <div
                  className={`chart-bar ${isAboveGoal ? 'above-goal' : ''} ${isBelowGoal ? 'below-goal' : ''}`}
                  style={{ height: `${height}%` }}
                >
                  <span className="bar-value">{record.calories}</span>
                </div>
                <div className="chart-bar-label">
                  {new Date(record.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                </div>
              </div>
            )
          })}
        </div>
        {user?.calorieGoal && (
          <div className="goal-line" style={{ bottom: `${(calorieGoal / maxCalories) * 100}%` }}>
            <span className="goal-label">Goal: {calorieGoal}</span>
          </div>
        )}
      </div>
    )
  }

  // Render macro breakdown pie chart (simple representation)
  const renderNutrientGoalTracking = () => {
    if (stats.totalDays === 0 || !recommendations) {
      return <div className="chart-empty">No data to display</div>
    }

    const rangeRecords = getRecordsInRange()
    const nutrientTracking = {}

    // Get all nutrients from recommendations
    const allNutrients = Object.keys(recommendations).filter(key => 
      !['Calories_kcal'].includes(key) && recommendations[key] > 0
    )

    // Calculate how often each nutrient goal was met
    allNutrients.forEach(nutrient => {
      const target = recommendations[nutrient]
      let metCount = 0

      rangeRecords.forEach(record => {
        const current = record.nutrients?.[nutrient] || 0
        if (current >= target) {
          metCount++
        }
      })

      nutrientTracking[nutrient] = {
        metCount,
        totalDays: rangeRecords.length,
        percentage: (metCount / rangeRecords.length) * 100,
        target
      }
    })

    // Sort nutrients by how often they were met
    const sortedNutrients = Object.entries(nutrientTracking).sort((a, b) => 
      b[1].percentage - a[1].percentage
    )

    // Get top 5 most met and bottom 5 least met
    const mostMet = sortedNutrients.slice(0, showAllNutrients ? sortedNutrients.length : 5)
    const leastMet = sortedNutrients.slice(showAllNutrients ? 0 : -5).reverse()

    // Format nutrient name for display
    const formatNutrientName = (key) => {
      return key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
    }

    const renderNutrientBar = (nutrient, data, index, type) => {
      const percentage = data.percentage
      const barColor = percentage >= 80 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444'

      // Show placeholder message if needed
      if (type === 'most' && data.percentage === 0 && index >= mostMet.filter(n => n[1].percentage > 0).length) {
        return (
          <div key={nutrient} className="nutrient-placeholder">
            <span className="placeholder-text">Time to put in the work! 💪</span>
          </div>
        )
      }

      return (
        <div key={nutrient} className="nutrient-bar-item">
          <div className="nutrient-bar-header">
            <span className="nutrient-name">{formatNutrientName(nutrient)}</span>
            <span className="nutrient-percentage">{percentage.toFixed(0)}%</span>
          </div>
          <div className="nutrient-bar-container">
            <div 
              className="nutrient-bar-fill" 
              style={{ width: `${percentage}%`, backgroundColor: barColor }}
            />
          </div>
          <span className="nutrient-count">{data.metCount}/{data.totalDays} days</span>
        </div>
      )
    }

    return (
      <div className="nutrient-goal-tracking">
        <div className="nutrient-tracking-columns">
          <div className="nutrient-column most-met">
            <h4>Most Often Met</h4>
            <div className="nutrient-list">
              {mostMet.map(([nutrient, data], index) => renderNutrientBar(nutrient, data, index, 'most'))}
            </div>
          </div>

          <div className="nutrient-column least-met">
            <h4>Least Often Met</h4>
            <div className="nutrient-list">
              {leastMet.map(([nutrient, data], index) => renderNutrientBar(nutrient, data, index, 'least'))}
            </div>
          </div>
        </div>

        {sortedNutrients.length > 10 && (
          <button 
            className="expand-nutrients-btn"
            onClick={() => setShowAllNutrients(!showAllNutrients)}
          >
            {showAllNutrients ? 'Show Less' : `Show All ${sortedNutrients.length} Nutrients`}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="analytics-tab">
      <div className="analytics-header">
        <h2>Analytics</h2>
        <div className="time-range-toggle">
          <button
            className={`toggle-button ${timeRange === 'week' ? 'active' : ''}`}
            onClick={() => setTimeRange('week')}
          >
            Last 7 Days
          </button>
          <button
            className={`toggle-button ${timeRange === 'month' ? 'active' : ''}`}
            onClick={() => setTimeRange('month')}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      <div className="analytics-content">
        {/* Summary Stats */}
        <div className="stats-section">
          <h3>Summary</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Avg Calories</span>
              <span className="stat-value">{stats.avgCalories.toFixed(0)}</span>
              <span className="stat-unit">kcal/day</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Days Logged</span>
              <span className="stat-value">{stats.totalDays}</span>
              <span className="stat-unit">of {timeRange === 'week' ? 7 : 30}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Avg Protein</span>
              <span className="stat-value">{stats.avgProtein.toFixed(1)}</span>
              <span className="stat-unit">g/day</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Avg Carbs</span>
              <span className="stat-value">{stats.avgCarbs.toFixed(1)}</span>
              <span className="stat-unit">g/day</span>
            </div>
          </div>
        </div>

        {/* Calorie Trend Chart */}
        <div className="chart-section">
          <h3>Calorie Trend</h3>
          <p className="chart-subtitle">Click any day to view details in History</p>
          {renderCalorieChart()}
        </div>

        {/* Macro Breakdown */}
        <div className="chart-section">
          <h3>Nutrient Goal Achievement</h3>
          <p className="chart-subtitle">Track your most and least consistently met nutrients</p>
          {renderNutrientGoalTracking()}
        </div>

        {/* Best/Worst Days */}
        {stats.totalDays > 0 && (
          <div className="insights-section">
            <h3>Insights</h3>
            <div className="insights-grid">
              {stats.bestDay && (
                <div
                  className="insight-card best-day"
                  onClick={() => handleDayClick(stats.bestDay.date)}
                >
                  <span className="insight-label">Closest to Goal</span>
                  <span className="insight-date">
                    {new Date(stats.bestDay.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                  <span className="insight-value">{stats.bestDay.calories} cal</span>
                </div>
              )}
              {stats.highestDay && (
                <div
                  className="insight-card highest-day"
                  onClick={() => handleDayClick(stats.highestDay.date)}
                >
                  <span className="insight-label">Highest Calories</span>
                  <span className="insight-date">
                    {new Date(stats.highestDay.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                  <span className="insight-value">{stats.highestDay.calories} cal</span>
                </div>
              )}
              {stats.worstDay && (
                <div
                  className="insight-card lowest-day"
                  onClick={() => handleDayClick(stats.worstDay.date)}
                >
                  <span className="insight-label">Lowest Calories</span>
                  <span className="insight-date">
                    {new Date(stats.worstDay.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                  <span className="insight-value">{stats.worstDay.calories} cal</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AnalyticsTab
