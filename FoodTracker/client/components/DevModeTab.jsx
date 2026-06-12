import React, { useState } from 'react'
import { apiUrl } from '../services/api'

const DevModeTab = () => {
  const [isResetting, setIsResetting] = useState(false)
  const [isDeletingAll, setIsDeletingAll] = useState(false)
  const [message, setMessage] = useState('')

  const handleResetDay = async () => {
    if (!window.confirm('Are you sure you want to reset all nutrients and food data for today? This action cannot be undone.')) {
      return
    }

    setIsResetting(true)
    setMessage('')

    try {
      const response = await fetch(apiUrl('/api/today'), {
        method: 'DELETE'
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

  const handleDeleteAllUserData = async () => {
    if (!window.confirm('Delete all local FoodTracker data for this installed app instance? This removes user settings, food library, today data, and history.')) {
      return
    }

    setIsDeletingAll(true)
    setMessage('')

    try {
      const response = await fetch(apiUrl('/api/user-data'), {
        method: 'DELETE'
      })

      if (response.ok) {
        setMessage('✓ All local user data deleted successfully.')
        setTimeout(() => setMessage(''), 5000)
      } else {
        const error = await response.json()
        setMessage(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting all user data:', error)
      setMessage('Error deleting all user data. Please try again.')
    } finally {
      setIsDeletingAll(false)
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

          <div className="action-section danger-section">
            <h3>Delete All User Data</h3>
            <p>Remove all local data for this app instance, including user settings, food library, current day, and history.</p>

            <button
              onClick={handleDeleteAllUserData}
              disabled={isDeletingAll}
              className="reset-button delete-all-button"
            >
              {isDeletingAll ? 'Deleting...' : 'Delete All User Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DevModeTab
