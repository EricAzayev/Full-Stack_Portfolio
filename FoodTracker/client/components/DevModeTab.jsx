import React, { useState } from 'react'

const DevModeTab = () => {
  const [isResetting, setIsResetting] = useState(false)
  const [message, setMessage] = useState('')

  const handleResetDay = async () => {
    if (!window.confirm('Are you sure you want to reset all nutrients and food data for today? This action cannot be undone.')) {
      return
    }

    setIsResetting(true)
    setMessage('')

    try {
      const response = await fetch('http://localhost:3001/api/reset-day', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const result = await response.json()
        setMessage('✓ Day reset successfully! All nutrients and food data have been cleared.')
        
        // Clear message after 5 seconds
        setTimeout(() => setMessage(''), 5000)
      } else {
        const error = await response.json()
        setMessage(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error resetting day:', error)
      setMessage('Error resetting day. Please try again.')
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="dev-mode-tab">
      <div className="dev-mode-content">
        <h2>Development Mode</h2>
        <p className="dev-description">
          This tab contains development tools for testing and debugging the application.
        </p>
        
        <div className="dev-actions">
          <div className="action-section">
            <h3>Reset Day</h3>
            <p>Reset all nutrients and food data for today back to zero.</p>
            
            {message && (
              <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                {message}
              </div>
            )}
            
            <button
              onClick={handleResetDay}
              disabled={isResetting}
              className="reset-button"
            >
              {isResetting ? 'Resetting...' : 'Reset Day'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DevModeTab
