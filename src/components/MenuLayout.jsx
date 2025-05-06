import "../css/MenuLayout.css";
import React, { useState } from "react";
import profileImg from "../assets/profile.png";
import menuIcon from "../assets/menu.svg";
import { constPath } from "../config.js";
import HistoryContent from "./HistoryContent";

/* 
This component is the layout of the menu displayed on the left side of the screen.
It contains the sidebar, the topbar, and the content.
Displayed in the dashboard and the overview page.
*/

const MenuLayout = ({ children }) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const userImg = sessionStorage.getItem("userImg");
  const userEmail = sessionStorage.getItem("userEmail");

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      {isSidebarVisible && (
        <div className="sidebar">
          <h2>Life Financial Planning</h2>
          <ul>
            <li><a href={constPath.dashboard}>Dashboard</a></li>
            <li><a href={constPath.overview}>Overview</a></li>
            <li>
              <button
                style={{ border: "none", background: "none", color: "white" }}
                onClick={() => setShowModal(true)}
              >
                History
              </button>
              {showModal && (
                <div className="historyPopup" onMouseDown={() => setShowModal(false)}>
                  <div className="popup-content" onMouseDown={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", justifyContent: "space-between" }} >
                      <h3 style={{ color: "black" }}>History</h3>
                      <button className="close-button" style={{ color: "black" }} onClick={() => setShowModal(false)}>
                        X
                      </button>
                    </div>
                    <HistoryContent
                      userEmail={userEmail}
                    />
                  </div>
                </div>
              )}
            </li>
          </ul>
        </div>
      )}
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
                {/* Go to the profile page */}
                <a href={`${constPath.profile}`}>View your profile</a>
                {/* Call the logout API to eliminate the session */}
                <a
                  href={`${process.env.REACT_APP_LFP_API_URL}/auth/oauth/logout`}
                >
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
