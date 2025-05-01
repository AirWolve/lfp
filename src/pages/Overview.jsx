import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Overview.css";
import BasicInfoBox from "../components/BasicInfoBox.jsx";
import InvestmentTypeBox from "../components/InvestmentTypeBox.jsx";
import InvestmentsBox from "../components/InvestmentsBox.jsx";
import EventSeriesBox from "../components/EventSeriesBox.jsx";
import { constPath } from "../config.js";
import MenuLayout from "../components/MenuLayout.jsx";

import {
  ResponsiveContainer,
  // LineChart,
  // Line,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  // CartesianGrid,
  // Tooltip,
  // Legend,
} from "recharts";

const Overview = () => {
  const navigate = useNavigate();
  const [simulationResult, setSimulationResult] = useState(null);

  useEffect(() => {
    const result = localStorage.getItem("simulationResult");
    if (result) {
      try {
        const parsedResult = JSON.parse(result);
        setSimulationResult(parsedResult);
      } catch (e) {
        setSimulationResult(result);
      }
    }
  }, []);

  const handleMakePlan = (e) => {
    e.preventDefault();
    navigate(`${constPath.SimulationInfo}`);
  };

  // const lineData = Array.from({ length: 10 }, (_, i) => ({
  //   year: 35 + i,
  //   value: 31.5 + i * 0.1,
  // }));

  return (
    <MenuLayout>
      <div className="overviewScreen">
          <button
            className="make-plan-btn"
            onClick={handleMakePlan}
            style={{ margin: "30px" }}
          >
            Start Simulation
          </button>
          {simulationResult ? (
            <div className="simulation-results">
              <h3>Simulation Results</h3>
              {typeof simulationResult === "object" ? (
                Object.entries(simulationResult).map(([key, value]) => (
                  <p key={key}>
                    <strong>{key}:</strong> <span>{value}</span>
                  </p>
                ))
              ) : (
                <pre>{simulationResult}</pre>
              )}
            </div>
          ) : (
            <div></div>
          )}
        <div className="main-content">
          <div className="charts">
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
            {/* <div className="line-chart-box">
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
          </div> */}
          </div>
        </div>
        <div className="summary-box-grid">
          <div className="summary-box">
            <BasicInfoBox />
          </div>
          <div className="summary-box">
            <InvestmentTypeBox />
          </div>
          <div className="summary-box">
            <InvestmentsBox />
          </div>
          <div className="summary-box">
            <EventSeriesBox />
          </div>
        </div>
      </div>
    </MenuLayout>
  );
};

export default Overview;
