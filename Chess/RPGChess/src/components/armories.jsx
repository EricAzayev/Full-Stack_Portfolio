import React from "react"

const Armories = () => {
  return (
    <div style={{ 
      backgroundColor: "black", 
      color: "white", 
      height: "100vh", 
      display: "flex", 
      flexDirection: "column", 
      justifyContent: "center", 
      alignItems: "center",
      padding: "20px"
    }}>
      <h1 style={{ fontSize: "48px", marginBottom: "40px" }}>Armories</h1>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
        gap: "20px", 
        maxWidth: "1200px",
        width: "100%"
      }}>
        <div style={{ 
          border: "2px solid #646cff", 
          borderRadius: "8px", 
          padding: "20px",
          backgroundColor: "#1a1a1a"
        }}>
          <h3>Armored Pawn</h3>
          <p>Cost: 100 gold</p>
          <p>A heavily armored pawn with increased defense.</p>
          <button style={{ 
            marginTop: "10px", 
            padding: "10px 20px", 
            backgroundColor: "#646cff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}>
            Purchase
          </button>
        </div>
        
        <div style={{ 
          border: "2px solid #646cff", 
          borderRadius: "8px", 
          padding: "20px",
          backgroundColor: "#1a1a1a"
        }}>
          <h3>Trench Pawn</h3>
          <p>Cost: 80 gold</p>
          <p>A pawn that can dig a trench in front of it to deter oncoming enemies.</p>
          <button style={{ 
            marginTop: "10px", 
            padding: "10px 20px", 
            backgroundColor: "#646cff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}>
            Purchase
          </button>
        </div>
        
        <div style={{ 
          border: "2px solid #646cff", 
          borderRadius: "8px", 
          padding: "20px",
          backgroundColor: "#1a1a1a"
        }}>
          <h3>Standard Pawn</h3>
          <p>Cost: 50 gold</p>
          <p>A standard pawn that would love to promote.</p>
          <button style={{ 
            marginTop: "10px", 
            padding: "10px 20px", 
            backgroundColor: "#646cff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}>
            Purchase
          </button>
        </div>
        
        <div style={{ 
          border: "2px solid #646cff", 
          borderRadius: "8px", 
          padding: "20px",
          backgroundColor: "#1a1a1a"
        }}>
          <h3>Knight</h3>
          <p>Cost: 120 gold</p>
          <p>A knight with high mobility and attack power.</p>
          <button style={{ 
            marginTop: "10px", 
            padding: "10px 20px", 
            backgroundColor: "#646cff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}>
            Purchase
          </button>
        </div>
        
        <div style={{ 
          border: "2px solid #646cff", 
          borderRadius: "8px", 
          padding: "20px",
          backgroundColor: "#1a1a1a"
        }}>
          <h3>Duck</h3>
          <p>Cost: 30 gold</p>
          <p>A duck can be placed anywhere, can't be killed, and does absolutely nothing.</p>
          <button style={{ 
            marginTop: "10px", 
            padding: "10px 20px", 
            backgroundColor: "#646cff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}>
            Purchase
          </button>
        </div>
        
        <div style={{ 
          border: "2px solid #646cff", 
          borderRadius: "8px", 
          padding: "20px",
          backgroundColor: "#1a1a1a"
        }}>
          <h3>Puffer</h3>
          <p>Cost: 60 gold</p>
          <p>A pufferfish that charges like a rook, pops to scare enemies.</p>
          <button style={{ 
            marginTop: "10px", 
            padding: "10px 20px", 
            backgroundColor: "#646cff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}>
            Purchase
          </button>
        </div>
      </div>
      
      <div style={{ 
        marginTop: "40px", 
        fontSize: "18px",
        color: "#888"
      }}>
        Gold: 70 pieces
      </div>
    </div>
  )
}

export default Armories
