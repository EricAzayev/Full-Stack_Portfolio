import React from 'react'
import { useParams, Link } from 'react-router-dom'
import Countdown from './Countdown'

function MountainDetail({ events, currentMonth, loading }) {
  const { mountainName } = useParams()
  const decodedMountainName = decodeURIComponent(mountainName)

  const getBackgroundImage = () => {
    const monthNames = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ]
    const monthIndex = currentMonth.getMonth()
    return `/images/top6_${monthNames[monthIndex]}.jpg`
  }

  const mountainEvents = events.filter(event => 
    event.mountain === decodedMountainName
  ).sort((a, b) => new Date(a.date + 'T12:00:00') - new Date(b.date + 'T12:00:00'))

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T12:00:00')
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const isEventPast = (dateString) => {
    const eventDate = new Date(dateString + 'T12:00:00')
    const now = new Date()
    return eventDate < now
  }

  // Check if it's a top 6 mountain
  const topSixMountains = [
    'Mount Marcy',
    'Algonquin Peak',
    'Haystack Mountain',
    'Mount Haystack',
    'Skylight Mountain',
    'Mount Skylight',
    'Whiteface Mountain',
    'Dix Mountain',
    'Mount Dix'
  ]

  const isTopSix = topSixMountains.some(name => 
    decodedMountainName.toLowerCase().includes(name.toLowerCase()) ||
    name.toLowerCase().includes(decodedMountainName.toLowerCase())
  )

  if (loading) {
    return <div className="loading">Loading mountain details...</div>
  }

  return (
    <div className="page-content mountain-detail-page" style={{ backgroundImage: `url(${getBackgroundImage()})` }}>
      <Link to="/browse-mountains" className="back-link">
        ← Back to Mountains
      </Link>

      <div className="page-header mountain-detail-header">
        <h2>{decodedMountainName}</h2>
        {isTopSix && <div className="top-six-badge-large">One of the 6 Tallest</div>}
        <p className="page-description">
          {mountainEvents.length} {mountainEvents.length === 1 ? 'hike' : 'hikes'} scheduled
        </p>
      </div>

      {mountainEvents.length === 0 ? (
        <div className="no-events">
          <p>No hikes currently scheduled for {decodedMountainName}.</p>
          <p className="hint">Check back later for upcoming events!</p>
        </div>
      ) : (
        <div className="events-grid">
          {mountainEvents.map((event, index) => (
            <div key={index} className={`event-card ${isEventPast(event.date) ? 'event-past' : ''}`}>
              <div className="event-header">
                <div className="date-badge">{formatDate(event.date)}</div>
              </div>
              
              <Countdown eventDate={event.date} />
              
              <div className="event-details">
                <div className="detail-row">
                  <span className="detail-label">Organizer:</span>
                  <span className="detail-value">{event.organizer}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Distance:</span>
                  <span className="detail-value">{event.miles}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Start Time:</span>
                  <span className="detail-value">{event.starttime || event.startTime}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Duration:</span>
                  <span className="detail-value">{event.duration}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Registered:</span>
                  <span className="detail-value">{event.register} hikers</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MountainDetail

