import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Dashboard.css";
import profileImg from "../assets/profile.png";
import menuIcon from "../assets/menu.svg";
import { constPath } from "../config.js";
import { useNavigate } from "react-router";

const Dashboard = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // withCredentials: Set to true to ensure HTTP-Only cookies are sent along.
    axios
      .get(`${process.env.REACT_APP_LFP_API_URL}/api/userinfo`, {
        withCredentials: true,
      })
      .then((response) => {
        setUser(response.data);
      })
      .catch((error) => {
        console.error("User info fetch error:", error);
        navigate(`${constPath.signIn}`);
      });
  }, [navigate]);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      {isSidebarVisible && (
        <div className="sidebar">
          <h2>Life Financial Planning</h2>
          <ul>
            <li>Dashboard</li>
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
              src={user.picture || profileImg}
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

        <div className="content">
          <h2>
            Good to see you again!
            <br />
            {user.name}
          </h2>
          <div className="button-grid">
            <button className="plan-button">
              <a href={`${constPath.basicSetting}`}>Create New Plan</a>
            </button>
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
