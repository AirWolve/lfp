import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Overview.css";
import BasicInfoBox from "../components/BasicInfoBox.jsx";
import InvestmentTypeBox from "../components/InvestmentTypeBox.jsx";
import InvestmentsBox from "../components/InvestmentsBox.jsx";
import EventSeriesBox from "../components/EventSeriesBox.jsx";
import { constPath } from "../config.js";
import MenuLayout from "../components/MenuLayout.jsx";
import testResult from "../test_result.json";

import {
  ResponsiveContainer,
  LineChart,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";

const Overview = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("chanceOfSuccess");
  const [selectedMetric, setSelectedMetric] = useState("total_investments");

  const handleMakePlan = (e) => {
    e.preventDefault();
    navigate(`${constPath.SimulationInfo}`);
  };

  // 성공확률 선형 그래프를 위한 연도, 수입, 순수익 데이터
  const barChartData = testResult.cashFlow.map((item) => ({
    year: item.year,
    income: item.income,
    net: item.net,
  }));

  // 성공 확률 데이터 변환
  const successRateData = Object.entries(testResult.chanceOfSuccess)
    .map(([year, successRate]) => ({
      year: parseInt(year, 10), // 연도를 숫자로 변환
      successRate, // 성공 확률 값
    }))
    .filter((item) => item.successRate >= 0 && item.successRate <= 300);

  const rangeOfRateData = Object.entries(
    testResult.quantileStats[selectedMetric]
  ).map(([year, stats]) => ({
    year: parseInt(year, 10), // 연도를 숫자로 변환
    median: stats.median,
    p10: stats.p10,
    p20: stats.p20,
    p30: stats.p30,
    p40: stats.p40,
    p60: stats.p60,
    p70: stats.p70,
    p80: stats.p80,
    p90: stats.p90,
  }));

  console.log("rangeOfRateData", rangeOfRateData);
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
              Range of Rate
            </button>
            <button
              className={`tab-button ${activeTab === "bar" ? "active" : ""}`}
              onClick={() => setActiveTab("bar")}
            >
              Bar Chart
            </button>
          </div>

          <div className="charts">
            {activeTab === "chanceToSuccess" && (
              <div className="linear-graph">
                <h3>Chance to Success</h3>
                <ResponsiveContainer height={300}>
                  <LineChart data={successRateData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis
                      domain={[0, 204]}
                      label={{
                        value: "Success Rate (%)", // 라벨 텍스트
                        angle: -90, // 라벨 각도 (세로 방향)
                        position: "insideLeft", // 라벨 위치
                        style: { textAnchor: "middle", fill: "#666" }, // 스타일
                      }}
                    />
                    <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="successRate"
                      stroke="#8884d8"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            {activeTab === "rangeOfRate" && (
              <div className="linear-graph">
                <h3>Range of Rate</h3>
                {/* 선택 가능한 항목 */}
                <div className="metric-selector">
                  <h4>
                    Select Metric: &nbsp;
                    <select
                      id="metric"
                      value={selectedMetric}
                      onChange={(e) => setSelectedMetric(e.target.value)}
                      style={{ width: "400px", marginBottom: "30px" }}
                    >
                      <option value="total_investments">
                        Total Investments
                      </option>
                      <option value="total_income">Total Income</option>
                      <option value="total_expenses">Total expense</option>
                      <option value="early_withdrawal_tax">
                        early withdrawal tax
                      </option>
                      <option value="discretionary_expense_pct">
                        Discretionary Spending Percentage
                      </option>
                    </select>
                  </h4>
                </div>
                {/* Range of Rate 차트 추가 (예시로 LineChart 사용) */}
                <ResponsiveContainer height={300}>
                  <ComposedChart data={rangeOfRateData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis
                      width={80}
                      label={{
                        value: "Value",
                        angle: -90,
                        position: "insideLeft",
                        style: { textAnchor: "middle", fill: "#666" },
                      }}
                    />
                    <Tooltip />
                    <Legend />
                    {/* 확률 범위 음영 처리 */}
                    <Area
                      type="monotone"
                      dataKey="p10"
                      stackId="1"
                      stroke="none"
                      fill="#8884d8"
                      fillOpacity={0.3} // 10%-90% 범위
                    />
                    <Area
                      type="monotone"
                      dataKey="p20"
                      stackId="1"
                      stroke="none"
                      fill="#82ca9d"
                      fillOpacity={0.4} // 20%-80% 범위
                    />
                    <Area
                      type="monotone"
                      dataKey="p30"
                      stackId="1"
                      stroke="none"
                      fill="#ffc658"
                      fillOpacity={0.5} // 30%-70% 범위
                    />
                    <Area
                      type="monotone"
                      dataKey="p40"
                      stackId="1"
                      stroke="none"
                      fill="#ff7300"
                      fillOpacity={0.6} // 40%-60% 범위
                    />
                    {/* 중간값 선 */}
                    <Line
                      type="monotone"
                      dataKey="median"
                      stroke="black"
                      dot={false}
                    />
                    {/* 재정 목표 수평선 */}
                    {selectedMetric === "total_investments" && (
                      <ReferenceLine
                        y={1000000}
                        label="Goal"
                        stroke="red"
                        strokeDasharray="3 3"
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
            {activeTab === "bar" && (
              <div className="bar-graph">
                <h3>Bar Chart</h3>
                <ResponsiveContainer height={300}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="income" fill="#8884d8" />
                    <Bar dataKey="net" fill="#82ca9d" />
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
