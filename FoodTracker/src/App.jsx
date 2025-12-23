import React, { useState } from "react";
import TodayTab from "./components/TodayTab";
import DevModeTab from "./components/DevModeTab";
import UserTab from "./components/UserTab";
import FoodLibraryTab from "./components/FoodLibraryTab";
import HistoryTab from "./components/HistoryTab";
import AnalyticsTab from "./components/AnalyticsTab";

function App() {
  const [activeTab, setActiveTab] = useState("today");
  const [selectedDate, setSelectedDate] = useState(null);

  //Analytics to History date click handler
  const handleAnalyticsDateClick = (dateString) => {
    setSelectedDate(dateString);
    setActiveTab("history");
  };

  //(for potential future use)
  const handleHistoryDateSelect = (dateString) => {
    setSelectedDate(dateString);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Food Tracker</h1>
        <nav className="tab-navigation">
          <button
            className={`tab-button ${activeTab === "today" ? "active" : ""}`}
            onClick={() => setActiveTab("today")}
          >
            Today
          </button>
          <button
            className={`tab-button ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            History
          </button>
          <button
            className={`tab-button ${
              activeTab === "analytics" ? "active" : ""
            }`}
            onClick={() => setActiveTab("analytics")}
          >
            Analytics
          </button>
          <button
            className={`tab-button ${activeTab === "foodLibrary" ? "active" : ""}`}
            onClick={() => setActiveTab("foodLibrary")}
          >
            Food Library
          </button>
          <button
            className={`tab-button ${activeTab === "user" ? "active" : ""}`}
            onClick={() => setActiveTab("user")}
          >
            User Settings
          </button>
          <button
            className={`tab-button ${activeTab === "dev" ? "active" : ""}`}
            onClick={() => setActiveTab("dev")}
          >
            Dev Mode
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeTab === "today" && <TodayTab />}
        {activeTab === "history" && (
          <HistoryTab 
            selectedDate={selectedDate} 
            onDateSelect={handleHistoryDateSelect} 
          />
        )}
        {activeTab === "analytics" && (
          <AnalyticsTab onDateClick={handleAnalyticsDateClick} />
        )}
        {activeTab === "foodLibrary" && <FoodLibraryTab />}
        {activeTab === "user" && <UserTab />}
        {activeTab === "dev" && <DevModeTab />}
      </main>
    </div>
  );
}

export default App;
