import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Play from './components/play.jsx'
import AnimationComponent from './components/animation.jsx'
import Armories from './components/armories.jsx'
import './style.css'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Play />} />
        <Route path="/animations" element={<AnimationComponent />} />
        <Route path="/armories" element={<Armories />} />
      </Routes>
    </Router>
  )
}

ReactDOM.createRoot(document.getElementById('app')).render(<App />)
