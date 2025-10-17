import React from "react"
import { useNavigate } from "react-router-dom"

//black screen, giant play button in the center
const Play = () => {
    const navigate = useNavigate()

    const handlePlay = () => {
        navigate("/animations")
    }

    return (
        <div style={{ backgroundColor: "black", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <button 
                onClick={handlePlay}
                style={{ fontSize: "48px", padding: "20px 40px" }}
            >
                Play
            </button>
        </div>
    )
}

export default Play