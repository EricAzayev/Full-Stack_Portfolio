import React from 'react'
import { useNavigate } from 'react-router-dom'

function MountainSelector({ events, currentMonth }) {
  const navigate = useNavigate()

  // Get unique mountains from events
  const getUniqueMountains = () => {
    const mountainMap = new Map()
    
    events.forEach(event => {
      if (!mountainMap.has(event.mountain)) {
        mountainMap.set(event.mountain, {
          name: event.mountain,
          eventCount: 1
        })
      } else {
        const mountain = mountainMap.get(event.mountain)
        mountain.eventCount++
      }
    })
    
    return Array.from(mountainMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    )
  }

  // Top 6 mountains for highlighting
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

  const isTopSix = (mountainName) => {
    return topSixMountains.some(name => 
      mountainName.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(mountainName.toLowerCase())
    )
  }

  const getBackgroundImage = () => {
    const monthNames = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ]
    const monthIndex = currentMonth.getMonth()
    return `/images/top6_${monthNames[monthIndex]}.jpg`
  }

  const handleMountainClick = (mountainName) => {
    const urlSafeName = encodeURIComponent(mountainName)
    navigate(`/mountain/${urlSafeName}`)
  }

  const mountains = getUniqueMountains()

  return (
    <div className="page-content mountain-selector-page" style={{ backgroundImage: `url(${getBackgroundImage()})` }}>
      <div className="page-header">
        <h2>Browse Mountains</h2>
        <p className="page-description">
          Select a mountain to view all upcoming hikes
        </p>
      </div>

      <div className="mountains-grid">
        {mountains.map((mountain, index) => (
          <div 
            key={index} 
            className={`mountain-card ${isTopSix(mountain.name) ? 'top-six' : ''}`}
            onClick={() => handleMountainClick(mountain.name)}
          >
            <div className="mountain-card-content">
              <h3 className="mountain-card-name">{mountain.name}</h3>
              {isTopSix(mountain.name) && (
                <div className="top-six-badge">Top 6</div>
              )}
              <div className="mountain-card-info">
                <span className="event-count">{mountain.eventCount} {mountain.eventCount === 1 ? 'hike' : 'hikes'}</span>
              </div>
              <div className="view-details-btn">View Details →</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MountainSelector



