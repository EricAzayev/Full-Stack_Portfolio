import React, { useState } from 'react'
import TodayTab from './components/TodayTab'

function App() {
  const [activeTab, setActiveTab] = useState('today')

  return (
    <div className="app">
      <header className="app-header">
        <h1>Food Tracker</h1>
        <nav className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'today' ? 'active' : ''}`}
            onClick={() => setActiveTab('today')}
          >
            Today
          </button>
          <button 
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
          <button 
            className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </nav>
      </header>
      
      <main className="app-main">
        {activeTab === 'today' && <TodayTab />}
        {activeTab === 'history' && <div>History tab coming soon...</div>}
        {activeTab === 'analytics' && <div>Analytics tab coming soon...</div>}
      </main>
    </div>
  )
}

export default App
