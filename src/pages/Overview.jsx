import React, { useEffect, useState } from "react";
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
  // AreaChart,
  // Area,
  Line,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  Legend,
  // ReferenceLine,
} from "recharts";

const Overview = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("chanceOfSuccess");
  const [selectedMetric, setSelectedMetric] = useState("total_investments");
  const [metric, setMetric] = useState("average");
  // aggregation threshold
  const [threshold, setThreshold] = useState(1000);

  const handleMakePlan = (e) => {
    e.preventDefault();
    navigate(`${constPath.SimulationInfo}`);
  };

  // 성공 확률 데이터 변환
  const successRateData = Object.entries(testResult.chanceOfSuccess)
    .map(([year, successRate]) => ({
      year: parseInt(year, 10), // 연도를 숫자로 변환
      successRate, // 성공 확률 값
    }))
    .filter((item) => item.successRate >= 0 && item.successRate <= 300);

  // RangeOfRate 데이터
  // const rangeOfRateData = useMemo(
  //   () =>
  //     Object.entries(testResult.quantileStats[selectedMetric]).map(
  //       ([year, stats]) => ({ year: +year, ...stats })
  //     ),
  //   [selectedMetric]
  // );

  // // fanData: p10 base + diff series
  // const fanData = useMemo(
  //   () =>
  //     rangeOfRateData.map((d) => ({
  //       year: d.year,
  //       base: d.p10,
  //       diff10_90: d.p90 - d.p10,
  //       diff20_80: d.p80 - d.p20,
  //       diff30_70: d.p70 - d.p30,
  //       diff40_60: d.p60 - d.p40,
  //       median: d.median,
  //     })),
  //   [rangeOfRateData]
  // );

  const [stackedBarData, setStackedBarData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);

  useEffect(() => {
    if (testResult.stackedBar) {
      setStackedBarData(testResult.stackedBar);
    }
  }, []);

  useEffect(() => {
    if (stackedBarData?.investments && stackedBarData?.expenses) {
      const combinedData = Object.entries(stackedBarData.investments).map(
        ([year, investmentData]) => {
          const expenseData = stackedBarData.expenses[year] || {};

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
        }
      );

      console.log("Combined Data with Threshold:", combinedData);
      setBarChartData(combinedData);
    }
  }, [metric, threshold, stackedBarData]);

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
            {/* 성공확률 차트 */}
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

            {/* Range of Rate 차트 */}
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
                      style={{ marginBottom: "10px", padding: "5px", width: "100px" }}
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

                {/* 4.3 투자 항목별 누적 막대 차트 */}
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
