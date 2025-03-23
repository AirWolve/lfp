import React, { useState } from "react";
import "./Dashboard.css";
import profileImg from "../assets/profile.png";
import menuIcon from "../assets/menu.svg";
import { constPath } from "../config.js";

const Dashboard = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      {isSidebarVisible && (
        <div className="sidebar">
          <h2>Life Financial Planning</h2>
          <ul>
            <li>Dashboard</li>
            <li>Progress</li>
            <li>Senario</li>
            <li>Simulation</li>
            <li>Previous Result</li>
            <li>Export</li>
            <li>Shared Users</li>
          </ul>
        </div>
      )}

      {/* Main */}
      <div className="main">
        <div className="topbar">
          <button className="menu-button" onClick={toggleSidebar}>
            <img src={menuIcon} alt="menu" className="menuIcon" />
          </button>
          <div className="profile-section">
            <img
              src={profileImg}
              alt="profile"
              className="profile-img"
              onClick={toggleProfileMenu}
            />
            {isProfileMenuOpen && (
              <div className="profile-dropdown">
                <a href={`${constPath.profile}`}>View your profile</a>
                <a href={`${constPath.home}`}>Log out</a>
              </div>
            )}
          </div>
        </div>

        <div className="content">
          <h2>Good to see you again!</h2>
          <div className="button-grid">
            <button className="plan-button"><a href={`${constPath.BasicSetting}`}>Create New Plan</a></button>
            <button className="plan-button">Import Plan</button>
            <button className="plan-button">Export Plan</button>
            <button className="plan-button">Existing Plans</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
