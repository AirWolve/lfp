import React, { useEffect, useState, useMemo } from "react";
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
  LineChart,
  // AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  Legend,
  // ReferenceLine,
  ComposedChart,
} from "recharts";

const Overview = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("chanceOfSuccess");

  const [metric, setMetric] = useState("average");
  // aggregation threshold
  const [threshold, setThreshold] = useState(1000);

  const handleMakePlan = (e) => {
    e.preventDefault();
    navigate(`${constPath.SimulationInfo}`);
  };

  // State to store the entire result object
  const [resultData, setResultData] = useState(null);

  // Load the entire result object from simResult in localStorage
  useEffect(() => {
    const storedData = localStorage.getItem("simResult");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (parsedData?.result) {
          setResultData(parsedData.result); // Store the result object
        } else {
          console.warn("No result data in simResult.");
        }
      } catch (error) {
        console.error("Error parsing simResult from localStorage:", error);
      }
    } else {
      console.warn("No simResult data in localStorage.");
    }
  }, []);

  // Extract "Chance of Success" data
  const chartData = useMemo(() => {
    if (resultData?.chanceOfSuccess) {
      return Object.entries(resultData.chanceOfSuccess).map(([id, value]) => ({
        id: parseInt(id, 10), // Convert year to number
        value, // Success rate value
      }));
    }
    return [];
  }, [resultData]);

  // Extract "Range of Rate" data
  const [selectedStat, setSelectedStat] = useState("total_investments");
  const filteredData = useMemo(() => {
    if (resultData?.quantileStats?.[selectedStat]) {
      return Object.entries(resultData.quantileStats[selectedStat]).map(
        ([year, data]) => ({
          year: parseInt(year, 10), // Convert year to number
          median: data.median || 0, // Median
          p10: data.p10 || 0,
          p90: data.p90 || 0,
          p20: data.p20 || 0,
          p80: data.p80 || 0,
          p30: data.p30 || 0,
          p70: data.p70 || 0,
          p40: data.p40 || 0,
          p60: data.p60 || 0,
        })
      );
    }
    return [];
  }, [resultData, selectedStat]);

  const fanData = useMemo(() => {
    return filteredData.map((d) => ({
      year: d.year,
      base: d.p10, // Set the p10 to baseline
      diff10_90: d.p90 - d.p10, // Range of p10-p90
      diff20_80: d.p80 - d.p20, // Range of p20-p80
      diff30_70: d.p70 - d.p30, // Range of p30-p70
      diff40_60: d.p60 - d.p40, // Range of p40-p60
      median: d.median, // Median
    }));
  }, [filteredData]);

  // Extract "Bar Chart" data
  const [barChartData, setBarChartData] = useState([]);
  useEffect(() => {
    if (
      resultData?.stackedBar?.investments &&
      resultData?.stackedBar?.expenses
    ) {
      const combinedData = Object.entries(
        resultData.stackedBar.investments
      ).map(([year, investmentData]) => {
        const expenseData = resultData.stackedBar.expenses[year] || {};

        const result = {
          year: parseInt(year, 10),
          cash: investmentData[metric]?.cash || 0,
          sp500: investmentData[metric]?.["S&P 500"] || 0,
          taxExemptBonds: investmentData[metric]?.["tax-exempt bonds"] || 0,
          food: expenseData[metric]?.food || 0,
          vacation: expenseData[metric]?.vacation || 0,
          streamingServices: expenseData[metric]?.["streaming services"] || 0,
          taxFederal: expenseData[metric]?.tax_federal || 0,
          taxState: expenseData[metric]?.tax_state || 0,
          taxCapitalGains: expenseData[metric]?.tax_capital_gains || 0,
          taxEarlyWithdrawal: expenseData[metric]?.tax_early_withdrawal || 0,
        };

        const other = Object.entries(result)
          .filter(([key, value]) => key !== "year" && value < threshold)
          .reduce((sum, [, value]) => sum + value, 0);

        const filteredResult = Object.fromEntries(
          Object.entries(result).map(([key, value]) =>
            key !== "year" && value < threshold ? [key, 0] : [key, value]
          )
        );

        return { ...filteredResult, other };
      });

      setBarChartData(combinedData);
    }
  }, [metric, threshold, resultData]);

  return (
    <MenuLayout>
      <div className="overviewScreen">
        <button
          className="make-plan-btn"
          onClick={handleMakePlan}
          style={{ marginLeft: "30px", marginTop: "20px" }}
        >
          Start Simulation
        </button>

        <div className="main-content">
          <div className="tabs">
            <button
              className={`tab-button ${
                activeTab === "chanceToSuccess" ? "active" : ""
              }`}
              onClick={() => setActiveTab("chanceToSuccess")}
            >
              Chance to Success
            </button>
            <button
              className={`tab-button ${
                activeTab === "rangeOfRate" ? "active" : ""
              }`}
              onClick={() => setActiveTab("rangeOfRate")}
            >
              Probability range over time
            </button>
            <button
              className={`tab-button ${activeTab === "bar" ? "active" : ""}`}
              onClick={() => setActiveTab("bar")}
            >
              Median or mean chart over time
            </button>
          </div>

          <div className="charts">
            {/* Chance to Success chart */}
            {activeTab === "chanceToSuccess" && (
              <div className="linear-graph">
                <h3>Chance to Success</h3>
                <ResponsiveContainer height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="id" />
                    <YAxis
                      domain={[0, 400]}
                      label={{
                        value: "Success Rate (%)", // Label text
                        angle: -90, // Label angle (vertical direction)
                        position: "insideLeft", // Label position
                        style: { textAnchor: "middle", fill: "#666" }, // Style
                      }}
                    />
                    <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8884d8"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Range of Rate chart */}
            {activeTab === "rangeOfRate" && (
              <div className="linear-graph">
                <h3>Range of Rate</h3>
                {/* Selectable items */}
                <div className="metric-selector">
                  <label>
                    Select Stat:
                    <select
                      value={selectedStat}
                      onChange={(e) => setSelectedStat(e.target.value)}
                      style={{
                        marginBottom: "10px",
                        padding: "5px",
                        width: "200px",
                      }}
                    >
                      <option value="total_investments">
                        Total Investments
                      </option>
                      <option value="total_income">Total Incomes</option>
                      <option value="total_expenses">Total Expenses</option>
                      <option value="early_withdrawal_tax">
                        Early Withdrawal Tax
                      </option>
                      <option value="discretionary_expense_pct">
                        Discretionary Expense
                      </option>
                    </select>
                  </label>
                </div>
                {/* Add Range of Rate chart (using LineChart as an example) */}
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart
                    data={fanData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(val) => val.toLocaleString()} />
                    <Legend />

                    {/* Set p10 as baseline */}
                    <Area
                      type="monotone"
                      dataKey="base"
                      stackId="1"
                      stroke="none"
                      fill="#ffffff"
                      fillOpacity={0}
                      name="Baseline (p10)"
                    />

                    {/* Outer 10–90% */}
                    <Area
                      type="monotone"
                      dataKey="diff10_90"
                      stackId="1"
                      stroke="none"
                      fill="#4e79a7"
                      fillOpacity={0.15}
                      name="10%-90%"
                    />

                    {/* 20–80% */}
                    <Area
                      type="monotone"
                      dataKey="diff20_80"
                      stackId="1"
                      stroke="none"
                      fill="#76b7b2"
                      fillOpacity={0.25}
                      name="20%-80%"
                    />

                    {/* 30–70% */}
                    <Area
                      type="monotone"
                      dataKey="diff30_70"
                      stackId="1"
                      stroke="none"
                      fill="#e15759"
                      fillOpacity={0.35}
                      name="30%-70%"
                    />

                    {/* 40–60% */}
                    <Area
                      type="monotone"
                      dataKey="diff40_60"
                      stackId="1"
                      stroke="none"
                      fill="#f28e2b"
                      fillOpacity={0.45}
                      name="40%-60%"
                    />

                    {/* Median line */}
                    <Line
                      type="monotone"
                      dataKey="median"
                      stroke="red"
                      strokeWidth={1}
                      dot={false}
                      name="Median"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Bar Chart */}
            {activeTab === "bar" && (
              <div className="linear-graph">
                <h3>Bar Chart</h3>
                <div className="options">
                  <label>
                    Metric:
                    <select
                      value={metric}
                      onChange={(e) => setMetric(e.target.value)}
                      style={{
                        marginBottom: "10px",
                        padding: "5px",
                        width: "100px",
                      }}
                    >
                      <option value="average">Average</option>
                      <option value="median">Median</option>
                    </select>
                  </label>
                  <label style={{ marginLeft: "20px" }}>
                    Threshold:
                    <input
                      type="number"
                      value={threshold}
                      onChange={(e) => setThreshold(Number(e.target.value))}
                      style={{
                        marginLeft: "10px",
                        padding: "5px",
                        width: "80px",
                      }}
                    />
                  </label>
                </div>

                {/* 4.3 stacked bar chart */}
                <h3>Investment Breakdown by {metric}</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={barChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(val) => val.toLocaleString()} />
                    <Legend />
                    <Bar dataKey="cash" stackId="a" fill="#8884d8" />
                    <Bar dataKey="sp500" stackId="a" fill="#82ca9d" />
                    <Bar dataKey="taxExemptBonds" stackId="a" fill="#ffc658" />
                    <Bar dataKey="food" stackId="b" fill="#ff8042" />
                    <Bar dataKey="vacation" stackId="b" fill="#8dd1e1" />
                    <Bar
                      dataKey="streamingServices"
                      stackId="b"
                      fill="#a4de6c"
                    />
                    <Bar dataKey="taxFederal" stackId="b" fill="#d0ed57" />
                    <Bar dataKey="taxState" stackId="b" fill="#ffc658" />
                    <Bar dataKey="taxCapitalGains" stackId="b" fill="#8884d8" />
                    <Bar
                      dataKey="taxEarlyWithdrawal"
                      stackId="b"
                      fill="#82ca9d"
                    />
                    <Bar dataKey="other" stackId="b" fill="#cccccc" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
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
