import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Overview.css";
import profileImg from "../assets/profile.png";
import menuIcon from "../assets/menu.svg";
import { constPath } from "../config.js";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const Overview = () => {
  const navigate = useNavigate();
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  useEffect(() => {
    // Get simulation result from localStorage
    const result = localStorage.getItem("simulationResult");
    if (result) {
      try {
        // if the result is json type then parse it
        const parsedResult = JSON.parse(result);
        setSimulationResult(parsedResult);
      } catch (e) {
        //Otherwise, just use it on its own
        setSimulationResult(result);
      }
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleMakePlan = (e) => {
    e.preventDefault();
    navigate(`${constPath.cashFlow}`);
  };

  const lineData = Array.from({ length: 10 }, (_, i) => ({
    year: 35 + i,
    value: 31.5 + i * 0.1,
  }));

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
        {/* Topbar */}
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

        {/* Content */}
        <div className="main-content">
          <button className="make-plan-btn" onClick={handleMakePlan}>
            Make Plan
          </button>
          {/* Prompt to ChatGPT: "Can you let me know how I create charts in HTML" */}
          {/* Charts */}
          <div className="charts">
            {/* 1-Dimensional Graph */}
            <div className="one-dimensional-graph">
              <h3>Preview For assets</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { param: 1, result: 50 },
                    { param: 2, result: 55 },
                    { param: 3, result: 59 },
                    { param: 4, result: 62 },
                    { param: 5, result: 65 },
                    { param: 6, result: 66 },
                    { param: 7, result: 66.5 },
                  ]}
                >
                  <XAxis
                    dataKey="param"
                    label={{
                      value: "Assets type",
                      position: "insideBottom",
                      offset: -5,
                    }}
                  />
                  <YAxis
                    label={{
                      value: "Selected Quantity",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Bar dataKey="result" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* 2-Dimensional Graph */}
            <div className="line-chart-box">
              <ResponsiveContainer width={400} height={250}>
                <LineChart
                  data={lineData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="1 1" />
                  <XAxis
                    dataKey="year"
                    label={{
                      value: "Next 10 Years",
                      position: "insideBottom",
                      offset: -5,
                    }}
                  />
                  <YAxis 
                  domain={["dataMin - 1", "dataMax + 1"]}
                  label={{
                    value: "change trend of assets",
                    angle: -90,
                    position: "insideLeft",
                    dy: 70,
                  }}
                  />
                  <Tooltip />
                  <Legend verticalAlign="top" height={30} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Projected Value"
                    stroke="#3f545c"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary */}
          <div className="summary-box">
            <p style={{fontWeight: "bold"}}>Overview your assets status</p>
            {simulationResult ? (
              <div className="simulation-results">
                <h3>Simulation Results</h3>
                {typeof simulationResult === "object" ? (
                  // Load the save data which is storing in local storage
                  Object.entries(simulationResult).map(([key, value]) => (
                    <p key={key}>
                      <strong>{key}:</strong> <span>{value}</span>
                    </p>
                  ))
                ) : (
                  // If it is a string, print it as is. 
                  <pre>{simulationResult}</pre>
                )}
              </div>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
