import React, { useState } from "react";
import profileImg from "../assets/profile.png";
import menuIcon from "../assets/menu.svg";
import { constPath } from "../config.js";

const MenuLayout = ({ children }) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const userImg = sessionStorage.getItem("userImg");

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      {isSidebarVisible && (
        <div className="sidebar">
          <h2>Life Financial Planning</h2>
          <ul>
            <li>Dashboard</li>
            <li>Simulation</li>
            <li>History</li>
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
              src={userImg || profileImg}
              alt="profile"
              className="profile-img"
              onClick={toggleProfileMenu}
            />
            {isProfileMenuOpen && (
              <div className="profile-dropdown">
                <a href={`${constPath.profile}`}>View your profile</a>
                <a href={`${process.env.REACT_APP_LFP_API_URL}/auth/oauth/logout`}>
                  Log out
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
};

export default MenuLayout; 