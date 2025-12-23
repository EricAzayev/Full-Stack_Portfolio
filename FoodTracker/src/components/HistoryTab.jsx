import React, { useState, useEffect } from 'react'

const HistoryTab = ({ selectedDate, onDateSelect }) => {
  const [records, setRecords] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(selectedDate || null)
  const [viewMode, setViewMode] = useState('calendar') // 'calendar' or 'list'

  // Fetch historical records
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/records')
        const data = await response.json()
        setRecords(data.records || [])
      } catch (error) {
        console.error('Error fetching records:', error)
      }
    }

    fetchRecords()
  }, [])

  // Update selected day if prop changes (from Analytics)
  useEffect(() => {
    if (selectedDate) {
      setSelectedDay(selectedDate)
      // Navigate to the month containing this date
      const date = new Date(selectedDate)
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1))
    }
  }, [selectedDate])

  // Calendar helpers
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const getRecordForDate = (dateString) => {
    return records.find(record => record.date === dateString)
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handleDayClick = (dateString) => {
    setSelectedDay(dateString)
    if (onDateSelect) {
      onDateSelect(dateString)
    }
  }

  // Render calendar grid
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const days = []

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = formatDate(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const record = getRecordForDate(dateString)
      const isSelected = selectedDay === dateString
      const isToday = dateString === new Date().toISOString().split('T')[0]

      days.push(
        <div
          key={day}
          className={`calendar-day ${record ? 'has-data' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
          onClick={() => handleDayClick(dateString)}
        >
          <div className="day-number">{day}</div>
          {record && (
            <div className="day-indicator">
              <span className="calorie-badge">{record.calories}</span>
            </div>
          )}
        </div>
      )
    }

    return days
  }

  // Render daily detail panel
  const renderDailyDetail = () => {
    if (!selectedDay) {
      return <div className="daily-detail-empty">Select a day to view details</div>
    }

    const record = getRecordForDate(selectedDay)
    
    if (!record) {
      return (
        <div className="daily-detail-empty">
          <p>No entries for {new Date(selectedDay).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      )
    }

    // Group foods by meal (this is basic - can be enhanced)
    const foods = Object.entries(record.food || {})

    return (
      <div className="daily-detail">
        <div className="daily-detail-header">
          <h3>{new Date(selectedDay).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
          <button className="edit-day-button">Edit Day</button>
        </div>

        <div className="daily-meals">
          <div className="meal-section">
            <h4>Food Entries</h4>
            {foods.map(([foodName, servings]) => (
              <div key={foodName} className="food-entry">
                <span className="food-name">{foodName}</span>
                <span className="food-servings">×{servings}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="daily-summary">
          <h4>Daily Summary</h4>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Calories</span>
              <span className="summary-value">{record.calories} kcal</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Protein</span>
              <span className="summary-value">{record.nutrients?.Protein_g?.toFixed(1) || 0}g</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Carbs</span>
              <span className="summary-value">{record.nutrients?.Carbohydrates_g?.toFixed(1) || 0}g</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Fats</span>
              <span className="summary-value">{record.nutrients?.Fats_g?.toFixed(1) || 0}g</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Fiber</span>
              <span className="summary-value">{record.nutrients?.Fiber_g?.toFixed(1) || 0}g</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render list view
  const renderListView = () => {
    const sortedRecords = [...records].sort((a, b) => new Date(b.date) - new Date(a.date))

    if (sortedRecords.length === 0) {
      return <div className="list-view-empty">No historical entries yet</div>
    }

    return (
      <div className="list-view">
        {sortedRecords.map(record => (
          <div
            key={record.date}
            className={`list-item ${selectedDay === record.date ? 'selected' : ''}`}
            onClick={() => handleDayClick(record.date)}
          >
            <div className="list-item-date">
              {new Date(record.date).toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
            <div className="list-item-calories">{record.calories} cal</div>
            <div className="list-item-macros">
              P: {record.nutrients?.Protein_g?.toFixed(0) || 0}g • 
              C: {record.nutrients?.Carbohydrates_g?.toFixed(0) || 0}g • 
              F: {record.nutrients?.Fats_g?.toFixed(0) || 0}g
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="history-tab">
      <div className="history-header">
        <h2>History</h2>
        <div className="view-toggle">
          <button
            className={`toggle-button ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            Calendar View
          </button>
          <button
            className={`toggle-button ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            List View
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="history-content">
          <div className="calendar-section">
            <div className="calendar-header">
              <button onClick={handlePrevMonth} className="month-nav-button">‹</button>
              <h3>
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <button onClick={handleNextMonth} className="month-nav-button">›</button>
            </div>

            <div className="calendar-weekdays">
              <div className="weekday">Sun</div>
              <div className="weekday">Mon</div>
              <div className="weekday">Tue</div>
              <div className="weekday">Wed</div>
              <div className="weekday">Thu</div>
              <div className="weekday">Fri</div>
              <div className="weekday">Sat</div>
            </div>

            <div className="calendar-grid">
              {renderCalendar()}
            </div>
          </div>

          <div className="detail-section">
            {renderDailyDetail()}
          </div>
        </div>
      ) : (
        <div className="history-content list-mode">
          <div className="list-section">
            {renderListView()}
          </div>
          <div className="detail-section">
            {renderDailyDetail()}
          </div>
        </div>
      )}
    </div>
  )
}

export default HistoryTab
