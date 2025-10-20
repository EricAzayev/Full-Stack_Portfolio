import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import userService from "../services/userService.js"

const Armories = () => {
  const navigate = useNavigate()
  const [playerGold, setPlayerGold] = useState(70)
  const [playerPieces, setPlayerPieces] = useState({})
  const [armoryPieces, setArmoryPieces] = useState({})
  const [savedArmories, setSavedArmories] = useState([])
  const [descriptions, setDescriptions] = useState({})
  const [costs, setCosts] = useState({})

  const fetchArmoryData = async () => {
    try {
      const response = await fetch('http://localhost:3002/armories')
      const data = await response.json()
      
      // Convert server data to the format we need
      const descriptionsObj = {}
      const costsObj = {}
      
      data.forEach(item => {
        descriptionsObj[item.name] = item.description
        costsObj[item.name] = item.cost
      })
      
      setDescriptions(descriptionsObj)
      setCosts(costsObj)
    } catch (error) {
      console.error('Error fetching armory data:', error)
    }
  }

  useEffect(() => {
    const loadPlayerData = async () => {
      try {
        // Load player data from server
        const playerData = await userService.getPlayerData()
        setPlayerGold(playerData.gold || 70)
        setPlayerPieces(playerData.pieces || {})
        
        // Also update localStorage for consistency
        localStorage.setItem('playerGold', (playerData.gold || 70).toString())
        localStorage.setItem('playerPieces', JSON.stringify(playerData.pieces || {}))
        
        // Get saved armories from database
        const savedArmoriesData = await userService.getUserArmories()
        setSavedArmories(savedArmoriesData || [])
      } catch (error) {
        console.error('Error loading player data:', error)
        // Fallback to localStorage
        const savedGold = localStorage.getItem('playerGold')
        const savedPieces = localStorage.getItem('playerPieces')
        const savedArmoriesData = localStorage.getItem('savedArmories')
        
        if (savedGold) {
          setPlayerGold(parseInt(savedGold))
        } else {
          setPlayerGold(70)
          localStorage.setItem('playerGold', '70')
        }
        if (savedPieces) setPlayerPieces(JSON.parse(savedPieces))
        if (savedArmoriesData) setSavedArmories(JSON.parse(savedArmoriesData))
      }
      
      // Always ensure General is available in armory pieces
      setArmoryPieces(prev => ({
        ...prev,
        General: 1 // Always have 1 General available
      }))
      
      // Fetch armory data from server
      fetchArmoryData()
    }
    
    loadPlayerData()
  }, [])

  const addToArmory = (pieceName) => {
    if (playerPieces[pieceName] > 0) {
      setArmoryPieces(prev => ({
        ...prev,
        [pieceName]: (prev[pieceName] || 0) + 1
      }))
      setPlayerPieces(prev => ({
        ...prev,
        [pieceName]: prev[pieceName] - 1
      }))
    }
  }

  const removeFromArmory = (pieceName) => {
    if (armoryPieces[pieceName] > 0 && pieceName !== 'General') {
      setArmoryPieces(prev => {
        const newArmory = { ...prev }
        if (newArmory[pieceName] > 1) {
          newArmory[pieceName] -= 1
        } else {
          delete newArmory[pieceName]
        }
        return newArmory
      })
      setPlayerPieces(prev => ({
        ...prev,
        [pieceName]: (prev[pieceName] || 0) + 1
      }))
    }
  }

  const calculateArmoryCost = () => {
    return Object.entries(armoryPieces).reduce((total, [pieceName, quantity]) => {
      return total + (costs[pieceName] * quantity)
    }, 0)
  }

  const createArmory = () => {
    // Save armory pieces to localStorage for chessboard
    localStorage.setItem('armoryPieces', JSON.stringify(armoryPieces))
    // Navigate to chessboard
    navigate("/chessboard")
  }

  const editArmory = (armory) => {
    // Save the armory to edit in localStorage
    localStorage.setItem('editingArmory', JSON.stringify(armory))
    // Load the armory pieces back into the current armory
    setArmoryPieces(armory.pieces)
    // Navigate to chessboard with existing pieces
    navigate("/chessboard")
  }

  const deleteArmory = (armoryId) => {
    if (confirm("Are you sure you want to delete this armory?")) {
      const updatedArmories = savedArmories.filter(armory => armory.id !== armoryId)
      setSavedArmories(updatedArmories)
      localStorage.setItem('savedArmories', JSON.stringify(updatedArmories))
    }
  }

  const sellAllPieces = async () => {
    if (Object.keys(playerPieces).length === 0) {
      alert("You don't have any pieces to sell!")
      return
    }

    if (confirm("Are you sure you want to sell ALL your pieces? This action cannot be undone.")) {
      try {

        // Calculate total gold to return
        let totalGoldReturned = 0
        Object.entries(playerPieces).forEach(([pieceName, quantity]) => {
          if (costs[pieceName]) {
            totalGoldReturned += costs[pieceName] * quantity
          }
        })

        // Add gold to player's account
        const newGold = playerGold + totalGoldReturned
        const newPieces = {}

        // Update server
        await userService.updatePlayerData(newGold, newPieces)

        // Update local state
        setPlayerGold(newGold)
        setPlayerPieces({})
        
        // Update localStorage
        localStorage.setItem('playerGold', newGold.toString())
        localStorage.setItem('playerPieces', JSON.stringify(newPieces))

        alert(`Sold all pieces for ${totalGoldReturned} gold! You now have ${newGold} gold.`)
      } catch (error) {
        console.error('Error selling pieces:', error)
        alert('Error selling pieces. Please try again.')
      }
    }
  }

  const getPieceImage = (pieceName) => {
    const imageMap = {
      'General': '/src/images/pieces/Blue_General.png',
      'Armored_Pawn': '/src/images/pieces/Blue_Armored.png',
      'Trench_Pawn': '/src/images/pieces/Blue_Trench_Pawn.png',
      'Pawn': '/src/images/pieces/Blue_Pawn.png',
      'Knight': '/src/images/pieces/Blue_Knight.png',
      'Duck': '/src/images/pieces/Blue_Duck.png',
      'Puffer': '/src/images/pieces/Blue_Puffer.png'
    }
    return imageMap[pieceName]
  }

  return (
    <div style={{ 
      backgroundColor: "black", 
      color: "white", 
      minHeight: "100vh", 
      display: "flex", 
      flexDirection: "column", 
      padding: "20px"
    }}>
      <h1 style={{ fontSize: "48px", marginBottom: "40px", textAlign: "center" }}>Armories</h1>
      
      {/* Navigation */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        marginBottom: "30px",
        fontSize: "20px"
      }}>
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            onClick={() => navigate("/shop")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#646cff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Go to Shop
          </button>
          <button 
            onClick={sellAllPieces}
            disabled={Object.keys(playerPieces).length === 0}
            style={{
              padding: "10px 20px",
              backgroundColor: Object.keys(playerPieces).length === 0 ? "#666" : "#ff4444",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: Object.keys(playerPieces).length === 0 ? "not-allowed" : "pointer",
              opacity: Object.keys(playerPieces).length === 0 ? 0.5 : 1
            }}
          >
            Sell All Pieces
          </button>
        </div>
        <div>Gold: {playerGold} pieces</div>
      </div>

      {/* Player's Available Pieces */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Your Pieces</h2>
        <div style={{ 
          display: "flex", 
          gap: "20px", 
          justifyContent: "center", 
          flexWrap: "wrap",
          marginBottom: "20px"
        }}>
          {Object.entries(playerPieces).map(([pieceName, quantity]) => {
            if (quantity > 0) {
              return (
                <div key={pieceName} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  backgroundColor: "#2a2a2a",
                  padding: "15px",
                  borderRadius: "8px",
                  border: "2px solid #646cff"
                }}>
                  <img 
                    src={getPieceImage(pieceName)} 
                    alt={pieceName}
                    style={{ width: "50px", height: "50px", objectFit: "contain" }}
                  />
                  <div>
                    <div>{pieceName.replace('_', ' ')}</div>
                    <div style={{ fontSize: "14px", color: "#888" }}>x{quantity}</div>
                  </div>
                  <button 
                    onClick={() => addToArmory(pieceName)}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#44ff44",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Add to Armory
                  </button>
                </div>
              )
            }
            return null
          })}
        </div>
      </div>

      {/* Current Armory */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Current Armory</h2>
        <div style={{ 
          display: "flex", 
          gap: "20px", 
          justifyContent: "center", 
          flexWrap: "wrap",
          minHeight: "100px",
          border: "2px dashed #646cff",
          padding: "20px",
          borderRadius: "8px"
        }}>
          {Object.keys(armoryPieces).length === 0 ? (
            <div style={{ color: "#888", fontSize: "18px" }}>No pieces in armory</div>
          ) : (
            Object.entries(armoryPieces).map(([pieceName, quantity]) => (
              <div key={pieceName} style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                backgroundColor: "#1a1a1a",
                padding: "15px",
                borderRadius: "8px",
                border: "2px solid #646cff"
              }}>
                <img 
                  src={getPieceImage(pieceName)} 
                  alt={pieceName}
                  style={{ width: "50px", height: "50px", objectFit: "contain" }}
                />
                <div>
                  <div>{pieceName.replace('_', ' ')}</div>
                  <div style={{ fontSize: "14px", color: "#888" }}>x{quantity}</div>
                </div>
                <button 
                  onClick={() => removeFromArmory(pieceName)}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "#ff4444",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Button */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <button 
          onClick={createArmory}
          disabled={Object.keys(armoryPieces).length === 0}
          style={{
            padding: "15px 30px",
            backgroundColor: Object.keys(armoryPieces).length === 0 ? "#666" : "#646cff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: Object.keys(armoryPieces).length === 0 ? "not-allowed" : "pointer",
            fontSize: "18px",
            opacity: Object.keys(armoryPieces).length === 0 ? 0.5 : 1
          }}
        >
          Place on Board
        </button>
      </div>

      {/* Saved Armories */}
      {savedArmories.length > 0 && (
        <div style={{ marginTop: "40px" }}>
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Saved Armories</h2>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
            gap: "20px",
            maxWidth: "1200px",
            margin: "0 auto"
          }}>
            {savedArmories.map((armory, index) => (
              <div key={armory.id} style={{
                backgroundColor: "#1a1a1a",
                border: "2px solid #646cff",
                borderRadius: "8px",
                padding: "20px",
                position: "relative"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                  <h3 style={{ margin: 0 }}>{armory.name || `Armory #${index + 1}`}</h3>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button 
                      onClick={() => editArmory(armory)}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#646cff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px"
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteArmory(armory.id)}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#ff4444",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px"
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <strong>Cost:</strong> {armory.cost}/70 gold
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <strong>Pieces:</strong>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "5px" }}>
                    {Object.entries(armory.pieces).map(([pieceName, quantity]) => (
                      <div key={pieceName} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        backgroundColor: "#2a2a2a",
                        padding: "5px 10px",
                        borderRadius: "4px",
                        fontSize: "12px"
                      }}>
                        <img 
                          src={getPieceImage(pieceName)} 
                          alt={pieceName}
                          style={{ width: "20px", height: "20px", objectFit: "contain" }}
                        />
                        <span>{quantity}x</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: "12px", color: "#888" }}>
                  Created: {new Date(armory.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Armories