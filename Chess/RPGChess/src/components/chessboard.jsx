import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import userService from "../services/userService.js"

const Chessboard = () => {
  const navigate = useNavigate()
  const [board, setBoard] = useState(Array(3).fill(null).map(() => Array(8).fill(null)))
  const [selectedPiece, setSelectedPiece] = useState(null)
  const [availablePieces, setAvailablePieces] = useState({})
  const [placedPieces, setPlacedPieces] = useState({})
  const [descriptions, setDescriptions] = useState({})
  const [costs, setCosts] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchArmoryData = async () => {
    try {
      setError(null)
      const response = await fetch('http://localhost:3002/armories')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
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
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching armory data:', error)
      setError('Failed to load piece data. Using fallback values.')
      
      // Set fallback costs to prevent null cost errors
      const fallbackCosts = {
        'General': 25,
        'Armored_Pawn': 10,
        'Trench_Pawn': 10,
        'Pawn': 5,
        'Knight': 15,
        'Duck': 15,
        'Puffer': 15
      }
      setCosts(fallbackCosts)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Load armory pieces from localStorage
    const savedPieces = localStorage.getItem('armoryPieces')
    if (savedPieces) {
      const pieces = JSON.parse(savedPieces)
      // Always ensure General is available
      pieces.General = 1
      setAvailablePieces(pieces)
    } else {
      // If no saved pieces, start with just General
      setAvailablePieces({ General: 1 })
    }
    
    // Check if we're editing an existing armory
    const editingArmory = localStorage.getItem('editingArmory')
    if (editingArmory) {
      const armory = JSON.parse(editingArmory)
      // Load the board state
      setBoard(armory.board.map(row => [...row]))
      // Calculate placed pieces from board
      const placedPiecesCount = {}
      armory.board.forEach(row => {
        row.forEach(piece => {
          if (piece) {
            placedPiecesCount[piece] = (placedPiecesCount[piece] || 0) + 1
          }
        })
      })
      setPlacedPieces(placedPiecesCount)
      // Remove placed pieces from available pieces, but keep General available
      const newAvailablePieces = { ...JSON.parse(savedPieces || '{}') }
      newAvailablePieces.General = 1 // Always keep General available
      Object.entries(placedPiecesCount).forEach(([piece, count]) => {
        if (piece !== 'General') {
          newAvailablePieces[piece] = (newAvailablePieces[piece] || 0) - count
          if (newAvailablePieces[piece] <= 0) {
            delete newAvailablePieces[piece]
          }
        }
      })
      setAvailablePieces(newAvailablePieces)
      // Clear the editing flag
      localStorage.removeItem('editingArmory')
    }
    
    // Fetch armory data from server
    fetchArmoryData()
  }, [])

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

  const handleSquareClick = (row, col) => {
    if (selectedPiece && availablePieces[selectedPiece] > 0) {
      // Place new piece from available pieces
      const newBoard = [...board]
      newBoard[row][col] = selectedPiece
      setBoard(newBoard)

      // Update available pieces
      const newAvailablePieces = { ...availablePieces }
      newAvailablePieces[selectedPiece] -= 1
      if (newAvailablePieces[selectedPiece] === 0) {
        delete newAvailablePieces[selectedPiece]
      }
      setAvailablePieces(newAvailablePieces)

      // Update placed pieces
      const newPlacedPieces = { ...placedPieces }
      newPlacedPieces[selectedPiece] = (newPlacedPieces[selectedPiece] || 0) + 1
      setPlacedPieces(newPlacedPieces)

      setSelectedPiece(null)
    } else if (board[row][col] && !selectedPiece) {
      // If clicking on a piece that's already placed, select it for moving
      setSelectedPiece(board[row][col])
    } else if (selectedPiece && !board[row][col]) {
      // Moving a piece to an empty square
      const newBoard = [...board]
      const pieceToMove = selectedPiece
      
      // Find the original position of the selected piece
      let originalRow = -1, originalCol = -1
      for (let r = 0; r < board.length; r++) {
        for (let c = 0; c < board[r].length; c++) {
          if (board[r][c] === pieceToMove) {
            originalRow = r
            originalCol = c
            break
          }
        }
        if (originalRow !== -1) break
      }
      
      if (originalRow !== -1) {
        // Move the piece
        newBoard[originalRow][originalCol] = null
        newBoard[row][col] = pieceToMove
        setBoard(newBoard)
        setSelectedPiece(null)
      }
    } else if (board[row][col] && selectedPiece && selectedPiece !== board[row][col]) {
      // If we have a selected piece and click on a different piece, swap them
      const newBoard = [...board]
      const pieceToMove = selectedPiece
      const pieceAtTarget = board[row][col]
      
      // Find the original position of the selected piece
      let originalRow = -1, originalCol = -1
      for (let r = 0; r < board.length; r++) {
        for (let c = 0; c < board[r].length; c++) {
          if (board[r][c] === pieceToMove) {
            originalRow = r
            originalCol = c
            break
          }
        }
        if (originalRow !== -1) break
      }
      
      if (originalRow !== -1) {
        // Swap the pieces
        newBoard[originalRow][originalCol] = pieceAtTarget
        newBoard[row][col] = pieceToMove
        setBoard(newBoard)
        setSelectedPiece(null)
      }
    } else if (board[row][col] && selectedPiece && selectedPiece === board[row][col]) {
      // If clicking on the same piece, deselect it
      setSelectedPiece(null)
    }
  }

  const handlePieceClick = (pieceName) => {
    if (availablePieces[pieceName] > 0) {
      setSelectedPiece(pieceName)
    }
  }

  const removePiece = (row, col) => {
    const pieceName = board[row][col]
    if (pieceName && pieceName !== 'General') {
      // Remove from board
      const newBoard = [...board]
      newBoard[row][col] = null
      setBoard(newBoard)

      // Add back to available pieces
      const newAvailablePieces = { ...availablePieces }
      newAvailablePieces[pieceName] = (newAvailablePieces[pieceName] || 0) + 1
      setAvailablePieces(newAvailablePieces)

      // Update placed pieces
      const newPlacedPieces = { ...placedPieces }
      newPlacedPieces[pieceName] -= 1
      if (newPlacedPieces[pieceName] === 0) {
        delete newPlacedPieces[pieceName]
      }
      setPlacedPieces(newPlacedPieces)
    }
  }

  const getSquareColor = (row, col) => {
    return (row + col) % 2 === 0 ? '#f0d9b5' : '#b58863'
  }

  const calculateTotalCost = () => {
    return Object.entries(placedPieces).reduce((total, [pieceName, quantity]) => {
      const pieceCost = costs[pieceName] || 0
      return total + (pieceCost * quantity)
    }, 0)
  }

  const saveArmory = async () => {
    // Check if General is present
    const hasGeneral = Object.keys(placedPieces).includes('General')
    if (!hasGeneral) {
      alert("You must include a General in your armory! The General is mandatory.")
      return
    }
    
    // Check if costs are loaded
    if (Object.keys(costs).length === 0) {
      alert("Loading piece data... Please wait a moment and try again.")
      return
    }
    
    try {
      // Check if we're editing an existing armory
      const editingArmory = localStorage.getItem('editingArmory')
      
      if (editingArmory) {
        // Editing existing armory
        const originalArmory = JSON.parse(editingArmory)
        const armoryName = prompt("Enter a name for your armory:", originalArmory.name)
        
        if (armoryName && armoryName.trim() !== '') {
          await userService.updateArmory(
            originalArmory.id,
            armoryName.trim(),
            board.map(row => [...row]),
            { ...placedPieces },
            calculateTotalCost()
          )
          
          alert(`Armory "${armoryName}" updated successfully!`)
          navigate("/armories")
        } else if (armoryName !== null) {
          alert("Please enter a valid name for your armory.")
        }
      } else {
        // Creating new armory
        const armoryName = prompt("Enter a name for your armory:", `Armory ${Date.now()}`)
        
        if (armoryName && armoryName.trim() !== '') {
          await userService.saveArmory(
            armoryName.trim(),
            board.map(row => [...row]),
            { ...placedPieces },
            calculateTotalCost()
          )
          
          alert(`Armory "${armoryName}" saved successfully!`)
          navigate("/armories")
        } else if (armoryName !== null) {
          alert("Please enter a valid name for your armory.")
        }
      }
    } catch (error) {
      console.error('Error saving armory:', error)
      alert('Error saving armory. Please try again.')
    }
  }

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
        Loading chessboard...
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
      {error && (
        <div style={{ 
          backgroundColor: "#ff4444", 
          color: "white", 
          padding: "10px", 
          marginBottom: "20px", 
          borderRadius: "4px",
          textAlign: "center"
        }}>
          {error}
        </div>
      )}
      <h1 style={{ fontSize: "48px", marginBottom: "40px", textAlign: "center" }}>Chessboard</h1>
      
      {/* Navigation */}
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
          Back to Armories
        </button>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
          <div style={{ 
            fontSize: "12px", 
            color: Object.keys(placedPieces).includes('General') ? "#44ff44" : "#ff4444" 
          }}>
            {Object.keys(placedPieces).includes('General') ? "✓ General included" : "⚠ General required"}
          </div>
        </div>
        <button 
          onClick={saveArmory}
          disabled={Object.keys(placedPieces).length === 0 || !Object.keys(placedPieces).includes('General')}
          style={{
            padding: "10px 20px",
            backgroundColor: !Object.keys(placedPieces).includes('General') ? "#666" : "#646cff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: !Object.keys(placedPieces).includes('General') ? "not-allowed" : "pointer",
            opacity: !Object.keys(placedPieces).includes('General') ? 0.5 : 1
          }}
        >
          Save Armory
        </button>
      </div>

      <div style={{ display: "flex", gap: "40px", justifyContent: "center", alignItems: "flex-start" }}>
        {/* Available Pieces */}
        <div style={{ minWidth: "200px" }}>
          <h3 style={{ textAlign: "center", marginBottom: "20px" }}>Available Pieces</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {Object.entries(availablePieces).map(([pieceName, quantity]) => (
              <div 
                key={pieceName}
                onClick={() => handlePieceClick(pieceName)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  backgroundColor: selectedPiece === pieceName ? "#646cff" : "#2a2a2a",
                  padding: "10px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  border: selectedPiece === pieceName ? "2px solid #646cff" : "2px solid transparent"
                }}
              >
                <img 
                  src={getPieceImage(pieceName)} 
                  alt={pieceName}
                  style={{ width: "30px", height: "30px", objectFit: "contain" }}
                />
                <div>
                  <div>{pieceName.replace('_', ' ')}</div>
                  <div style={{ fontSize: "12px", color: "#888" }}>x{quantity}</div>
                </div>
              </div>
            ))}
          </div>
          {Object.keys(availablePieces).length === 0 && (
            <div style={{ color: "#888", textAlign: "center" }}>No pieces available</div>
          )}
        </div>

        {/* Chessboard */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h3 style={{ marginBottom: "20px" }}>3x8 Chessboard</h3>
          {selectedPiece && (
            <div style={{
              backgroundColor: "#646cff",
              color: "white",
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "14px",
              marginBottom: "10px"
            }}>
              Selected: {selectedPiece.replace('_', ' ')} - Click to place or move
            </div>
          )}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(8, 60px)",
            gridTemplateRows: "repeat(3, 60px)",
            gap: "2px",
            border: "3px solid #646cff",
            padding: "10px",
            backgroundColor: "#1a1a1a"
          }}>
            {board.map((row, rowIndex) => 
              row.map((piece, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    removePiece(rowIndex, colIndex)
                  }}
                  style={{
                    width: "60px",
                    height: "60px",
                    backgroundColor: getSquareColor(rowIndex, colIndex),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: selectedPiece ? "pointer" : "default",
                    border: selectedPiece ? "2px dashed #646cff" : "1px solid #333",
                    position: "relative"
                  }}
                >
                  {piece && (
                    <img 
                      src={getPieceImage(piece)} 
                      alt={piece}
                      style={{ 
                        width: "50px", 
                        height: "50px", 
                        objectFit: "contain",
                        cursor: "pointer",
                        border: selectedPiece === piece ? "3px solid #ffdd44" : "none",
                        borderRadius: "4px"
                      }}
                    />
                  )}
                  {selectedPiece && !piece && (
                    <div style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      color: "#646cff",
                      fontSize: "24px",
                      opacity: 0.5
                    }}>
                      +
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          <div style={{ marginTop: "10px", fontSize: "14px", color: "#888", textAlign: "center" }}>
            Click piece to select • Click empty square to move • Click different piece to swap • Right-click to remove (General cannot be removed)
          </div>
        </div>

        {/* Placed Pieces Summary */}
        <div style={{ minWidth: "200px" }}>
          <h3 style={{ textAlign: "center", marginBottom: "20px" }}>Placed Pieces</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {Object.entries(placedPieces).map(([pieceName, quantity]) => (
              <div key={pieceName} style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                backgroundColor: "#2a2a2a",
                padding: "10px",
                borderRadius: "8px"
              }}>
                <img 
                  src={getPieceImage(pieceName)} 
                  alt={pieceName}
                  style={{ width: "30px", height: "30px", objectFit: "contain" }}
                />
                <div>
                  <div>{pieceName.replace('_', ' ')}</div>
                  <div style={{ fontSize: "12px", color: "#888" }}>x{quantity}</div>
                </div>
              </div>
            ))}
          </div>
          {Object.keys(placedPieces).length === 0 && (
            <div style={{ color: "#888", textAlign: "center" }}>No pieces placed</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Chessboard
