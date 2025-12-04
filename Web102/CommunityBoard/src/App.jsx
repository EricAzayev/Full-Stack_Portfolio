import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import webDevImage from "./assets/images/computer-architecture.jpg";
import javaImage from "./assets/images/Jav.jpg";
import aiImage from "./assets/images/computer-architecture.jpg";

import Event from "./assets/Event";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="overall">
        <div></div>
        <div>
          <h1 className="header">CS Club Events</h1> <br></br>
          <h2 className="header">
            Sign up for mentorship, games, and overall career support!
          </h2>
        </div>

        <div id="events">
          <Event
            title="Web Development Workshop"
            description="Hands-on learning with HTML, CSS, and JavaScript."
            imageSRC={webDevImage}
          />
          <Event
            title="Java Starter Workshop"
            description="Java is so good its really good."
            imageSRC={javaImage}
          />
          <Event
            title="AI Wednesdays"
            description="Learn to talk with your AI overlords"
            imageSRC={aiImage}
          />
        </div>
      </div>
    </>
  );
}

export default App;
