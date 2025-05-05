import React, { useState } from "react";
import profileImg from "../assets/profile.png";
import menuIcon from "../assets/menu.svg";
import { constPath } from "../config.js";
import "../css/MenuLayout.css";
import HistoryContent from "./HistoryContent";

const MenuLayout = ({ children }) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const SenarioHistory = [
    {
      name: "Retirement Plan",
      createdAt: "2024-10-31T13:13:00",
    },
    {
      name: "Education Plan",
      createdAt: "2024-10-31T15:13:00",
    },
  ];
  // Example data to populate SenarioHistory
  const exampleData = [
    {
      name: "Vacation Plan",
      createdAt: "2024-11-01T10:00:00",
    },
    {
      name: "Emergency Fund",
      createdAt: "2024-11-02T14:30:00",
    },
  ];

  // Merge example data with existing SenarioHistory
  SenarioHistory.push(...exampleData);
  const handleEditScenario = (index) => {
    console.log("Editing scenario at index:", index);
    // TODO: 원하는 방식으로 시나리오 불러오기/이동 구현
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const userImg = sessionStorage.getItem("userImg");
  // const basicInfo = JSON.parse(localStorage.getItem("basicInfo")) || null;
  // const currentTime = new Date();
  // const formattedDate = currentTime.toLocaleDateString();

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      {isSidebarVisible && (
        <div className="sidebar">
          <h2>Life Financial Planning</h2>
          <ul>
            <li>Dashboard</li>
            <li>Simulation</li>
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
                      <button className="close-button" style={{color: "black"}} onClick={() => setShowModal(false)}>
                        X
                      </button>
                    </div>
                    <HistoryContent
                      SenarioHistory={SenarioHistory}
                      handleEditScenario={handleEditScenario}
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
                <a href={`${constPath.profile}`}>View your profile</a>
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
