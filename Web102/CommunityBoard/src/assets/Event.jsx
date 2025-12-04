import React from "react";

const Event = ({ title, description, imageSRC }) => {
  const mainStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "linear-gradient(to right, #4B0082, #8A2BE2)",
    color: "white",
    padding: "20px",
  };

  const cardStyle = {
    width: "300px",
    backgroundColor: "#fff",
    color: "#333",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    overflow: "hidden",
    textAlign: "center",
    transition:
      "transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease",
  };

  const hoverStyle = {
    transform: "scale(1.1)", // Makes it pop out
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.3)", // Adds depth
    backgroundColor: "#ffcc00", // Changes color on hover
    cursor: "pointer",
  };

  const imageStyle = {
    width: "100%",
    height: "180px",
    objectFit: "cover",
  };

  const textStyle = {
    padding: "15px",
  };

  // State to track hover effect
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div style={mainStyle}>
      <a>
        <div
          style={isHovered ? { ...cardStyle, ...hoverStyle } : cardStyle}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <img src={imageSRC} alt={title} style={imageStyle} />
          <div style={textStyle}>
            <h3>{title}</h3>
            <h4>{description}</h4>
          </div>
        </div>
      </a>
    </div>
  );
};

export default Event;
