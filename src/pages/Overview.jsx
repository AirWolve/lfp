import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Overview.css";
import profileImg from "../assets/profile.png";
import menuIcon from "../assets/menu.svg";
import { constPath } from "../config.js";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis } from "recharts";

const Overview = () => {
  const navigate = useNavigate();
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleMakePlan = (e) => {
    e.preventDefault();
    navigate(`${constPath.cashFlow}`);
  }

  const pieData = [
    { name: "Category A", value: 50 },
    { name: "Category B", value: 20 },
    { name: "Category C", value: 13 },
    { name: "Category D", value: 10 },
    { name: "Category E", value: 7 },
  ];

  const lineData = Array.from({ length: 10 }, (_, i) => ({
    year: 35 + i,
    value: 31.5 + i * 0.1,
  }));

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f7f", "#a0d8ef"];

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
            <div className="pie-group">
              {["Income", "Account", "Assets"].map((label, idx) => (
                <div key={idx} className="pie-chart-box">
                  <h4>{label}</h4>
                  <PieChart width={140} height={140}>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      outerRadius={60}
                      innerRadius={35}
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </div>
              ))}
            </div>

            <div className="line-chart-box">
              <ResponsiveContainer width={400} height={200}>
                <LineChart data={lineData}>
                  <XAxis
                    dataKey="year"
                    label={{
                      value: "Next 10 Years",
                      position: "insideBottom",
                      offset: -5,
                    }}
                  />
                  <YAxis domain={["dataMin", "dataMax"]} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3f545c"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary */}
          <div className="summary-box">
            <p>
              <strong>Monthly Income</strong> <span>$0,000</span>
            </p>
            <p>
              <strong>Yearly Income</strong> <span>$00,000</span>
            </p>
            <p>
              <strong>Living expense</strong> <span>$000</span>
            </p>
            <p>
              <strong>Regular expense</strong> <span>$000</span>
            </p>
            <p>
              <strong>Debt</strong> <span>$00,000</span>
            </p>
            <p>
              <strong>Assets</strong> <span>$000,000</span>
            </p>
            <p>
              <strong>Tax</strong> <span>0.00%</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
