import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import userService from "../services/userService.js"

const Shop = () => {
  const navigate = useNavigate()
  const [cart, setCart] = useState({})
  const [playerGold, setPlayerGold] = useState(70)
  const [descriptions, setDescriptions] = useState({})
  const [costs, setCosts] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  const fetchArmoryData = async () => {
    try {
      console.log('Fetching armory data from server...')
      const response = await fetch('http://localhost:3002/armories')
      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Received data:', data)
      
      // Convert server data to the format we need
      const descriptionsObj = {}
      const costsObj = {}
      
      data.forEach(item => {
        descriptionsObj[item.name] = item.description
        costsObj[item.name] = item.cost
      })
      
      console.log('Processed descriptions:', descriptionsObj)
      console.log('Processed costs:', costsObj)
      
      setDescriptions(descriptionsObj)
      setCosts(costsObj)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching armory data:', error)
      console.error('Error details:', error.message)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const loadPlayerData = async () => {
      try {
        // Load player data from server
        const playerData = await userService.getPlayerData()
        setPlayerGold(playerData.gold || 70)
        
        // Also update localStorage for consistency
        localStorage.setItem('playerGold', (playerData.gold || 70).toString())
        localStorage.setItem('playerPieces', JSON.stringify(playerData.pieces || {}))
      } catch (error) {
        console.error('Error loading player data:', error)
        // Fallback to localStorage
        const savedGold = localStorage.getItem('playerGold')
        if (savedGold) {
          setPlayerGold(parseInt(savedGold))
        } else {
          setPlayerGold(70)
          localStorage.setItem('playerGold', '70')
        }
      }
      
      // Fetch armory data from server
      fetchArmoryData()
    }
    
    loadPlayerData()
  }, [])

  const addToCart = (pieceName) => {
    setCart(prev => ({
      ...prev,
      [pieceName]: (prev[pieceName] || 0) + 1
    }))
  }

  const removeFromCart = (pieceName) => {
    setCart(prev => {
      const newCart = { ...prev }
      if (newCart[pieceName] > 1) {
        newCart[pieceName] -= 1
      } else {
        delete newCart[pieceName]
      }
      return newCart
    })
  }

  const calculateTotalCost = () => {
    return Object.entries(cart).reduce((total, [pieceName, quantity]) => {
      return total + (costs[pieceName] * quantity)
    }, 0)
  }

  const buyPieces = async () => {
    const totalCost = calculateTotalCost()
    if (totalCost <= playerGold) {
      try {
        const newGold = playerGold - totalCost
        
        // Calculate new pieces
        const savedPieces = localStorage.getItem('playerPieces')
        const currentPieces = savedPieces ? JSON.parse(savedPieces) : {}
        const newPieces = { ...currentPieces }
        Object.entries(cart).forEach(([pieceName, quantity]) => {
          newPieces[pieceName] = (newPieces[pieceName] || 0) + quantity
        })
        
        // Update server
        await userService.updatePlayerData(newGold, newPieces)
        
        // Update local state and localStorage
        setPlayerGold(newGold)
        setCart({})
        localStorage.setItem('playerGold', newGold.toString())
        localStorage.setItem('playerPieces', JSON.stringify(newPieces))
        
        alert("Pieces purchased successfully!")
      } catch (error) {
        console.error('Error buying pieces:', error)
        alert('Error buying pieces. Please try again.')
      }
    } else {
      alert("Not enough gold!")
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

  const pieces = Object.keys(descriptions)

  if (isLoading) {
    return (
      <div style={{ 
        backgroundColor: "black", 
        color: "white", 
        minHeight: "100vh", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        fontSize: "24px"
      }}>
        Loading shop data...
      </div>
    )
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
      <h1 style={{ fontSize: "48px", marginBottom: "40px", textAlign: "center" }}>Shop</h1>
      
      {/* Navigation and Player Stats */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        marginBottom: "30px",
        fontSize: "20px",
        alignItems: "center"
      }}>
        <button 
          onClick={() => navigate("/armories")}
          style={{
            padding: "10px 20px",
            backgroundColor: "#646cff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Go to Armories
        </button>
        <div>Gold: {playerGold} pieces</div>
        <div>Total Cost: {calculateTotalCost()} pieces</div>
      </div>

      {/* Shop Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
        gap: "20px", 
        maxWidth: "1200px",
        width: "100%",
        margin: "0 auto"
      }}>
        {pieces.map(pieceName => (
          <div key={pieceName} style={{ 
            border: "2px solid #646cff", 
            borderRadius: "8px", 
            padding: "20px",
            backgroundColor: "#1a1a1a",
            textAlign: "center"
          }}>
            <img 
              src={getPieceImage(pieceName)} 
              alt={pieceName}
              style={{ 
                width: "80px", 
                height: "80px", 
                objectFit: "contain",
                marginBottom: "15px"
              }}
            />
            <h3>{pieceName.replace('_', ' ')}</h3>
            <p style={{ color: "#646cff", fontWeight: "bold" }}>Cost: {costs[pieceName]} gold</p>
            <p style={{ fontSize: "14px", marginBottom: "15px" }}>{descriptions[pieceName]}</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button 
                onClick={() => removeFromCart(pieceName)}
                style={{ 
                  padding: "5px 10px", 
                  backgroundColor: "#ff4444",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
                disabled={!cart[pieceName]}
              >
                -
              </button>
              <span style={{ padding: "5px 10px" }}>{cart[pieceName] || 0}</span>
              <button 
                onClick={() => addToCart(pieceName)}
                style={{ 
                  padding: "5px 10px", 
                  backgroundColor: "#44ff44",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Shopping Cart Sleeve */}
      {Object.keys(cart).length > 0 && (
        <div style={{
          position: "fixed",
          bottom: "0",
          left: "0",
          right: "0",
          backgroundColor: "#1a1a1a",
          border: "2px solid #646cff",
          padding: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {Object.entries(cart).map(([pieceName, quantity]) => (
              <div key={pieceName} style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                backgroundColor: "#2a2a2a",
                padding: "5px 10px",
                borderRadius: "4px"
              }}>
                <img 
                  src={getPieceImage(pieceName)} 
                  alt={pieceName}
                  style={{ width: "30px", height: "30px", objectFit: "contain" }}
                />
                <span>{quantity}x</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div>Total: {calculateTotalCost()} gold</div>
            <button 
              onClick={buyPieces}
              style={{
                padding: "10px 20px",
                backgroundColor: "#646cff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "16px"
              }}
            >
              Buy
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Shop
