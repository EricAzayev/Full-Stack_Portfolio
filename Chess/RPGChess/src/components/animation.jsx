//Style: Black Background with White Text typed out.

//Image 1 is shown, with text1 typed. Then, Image 2 is shown, with text2 typed.
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AnimationComponent = () => {
  const navigate = useNavigate();
  const [currentScene, setCurrentScene] = useState(0);

  // /opening route
  //scene 1
  const text1_general =
    "Once upon a time, Empassent City was a beacon of the middle ages. It held a statue of King Empassent, composed of the entire cauffers of the empire.";
  //scene 2
  const text2_general =
    "One morning, the statue vanished without a trace, leaving the city in turmoil. The king awoke, angry, and declared immediate war on the Gambit Empire.";

  //scene 3
  const text3_king =
    "Wake up general. You have a royal mission to complete. Today, you will march to the Gambit Empire and reclaim what is rightfully ours.";
  const text4_general =
    "But I need more troops, my king. Our army is not strong enough to face the Gambit forces alone.";
  const text5_king =
    "I have alotted you 70 gold pieces. Use them wisely soldier, and return victorious!";

  const scenes = [
    {
      image: "/src/images/scenes/scene_1.png",
      text: text1_general,
      alt: "Scene 1",
    },
    {
      image: "/src/images/scenes/scene_2.png",
      text: text2_general,
      alt: "Scene 2",
    },
    {
      image: "/src/images/scenes/scene_3.png",
      text: [text3_king, text4_general, text5_king],
      alt: "Scene 3",
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentScene < scenes.length - 1) {
        setCurrentScene(currentScene + 1);
      } else {
        // After all scenes, redirect to armories
        navigate("/armories");
      }
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, [currentScene, navigate, scenes.length]);

  const currentSceneData = scenes[currentScene];

  return (
    <div
      style={{
        backgroundColor: "black",
        color: "white",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        fontSize: "24px",
      }}
    >
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <img
          src={currentSceneData.image}
          alt={currentSceneData.alt}
          style={{ maxWidth: "100%", height: "auto", marginBottom: "20px" }}
        />
        {Array.isArray(currentSceneData.text) ? (
          currentSceneData.text.map((text, index) => (
            <p key={index} style={{ margin: "10px 0" }}>
              {text}
            </p>
          ))
        ) : (
          <p>{currentSceneData.text}</p>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          fontSize: "16px",
          opacity: "0.7",
        }}
      >
        Scene {currentScene + 1} of {scenes.length}
      </div>
    </div>
  );
};
export default AnimationComponent;
