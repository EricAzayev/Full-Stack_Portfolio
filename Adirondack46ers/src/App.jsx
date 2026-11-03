import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import TheSix from './components/TheSix'
import AllUpcomingHikes from './components/AllUpcomingHikes'
import MountainSelector from './components/MountainSelector'
import MountainDetail from './components/MountainDetail'
import fallbackEvents from './fallbackEvents'

function App() {
  const [currentMonth, setCurrentMonth] = useState(new Date()) // open on the current month
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/events')
      const data = await response.json()
      // Static deploy: fall back to the bundled seed when the backend fails.
      setEvents(Array.isArray(data) && data.length > 0 ? data : fallbackEvents())
    } catch (error) {
      console.error('Error fetching events, using fallback:', error)
      setEvents(fallbackEvents())
    } finally {
      setLoading(false)
    }
  }

  const handlePreviousMonth = () => {
    setCurrentMonth(prevMonth => {
      const newDate = new Date(prevMonth)
      newDate.setMonth(newDate.getMonth() - 1)
      return newDate
    })
  }

  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => {
      const newDate = new Date(prevMonth)
      newDate.setMonth(newDate.getMonth() + 1)
      return newDate
    })
  }

  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="app">
        <Header 
          currentMonth={getMonthName(currentMonth)}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
        />
        <Routes>
          <Route 
            path="/" 
            element={
              <TheSix 
                events={events} 
                currentMonth={currentMonth}
                loading={loading}
              />
            } 
          />
          <Route 
            path="/all-hikes" 
            element={
              <AllUpcomingHikes 
                events={events} 
                currentMonth={currentMonth}
                loading={loading}
              />
            } 
          />
          <Route 
            path="/browse-mountains" 
            element={
              <MountainSelector 
                events={events} 
                currentMonth={currentMonth}
                loading={loading}
              />
            } 
          />
          <Route 
            path="/mountain/:mountainName" 
            element={
              <MountainDetail 
                events={events} 
                currentMonth={currentMonth}
                loading={loading}
              />
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App

