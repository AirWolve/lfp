import React, { useState } from "react";
import "../css/SimulationInfo.css";
import { useNavigate } from "react-router-dom";
import { constPath } from "../config.js";
import { toast } from "react-toastify";
import TaxFileImport from "../components/TaxFileImport.jsx";

const SimulationInfo = () => {
  const rawData = localStorage.getItem("BasicSettings");
  const data = JSON.parse(rawData);
  // Set Default Values
  const defaultScenarioData = {
    inflationAssumption: { type: "fixed", value: null },
    afterTaxContributionLimit: null,
    spendingStrategy: [],
    expenseWithdrawalStrategy: [],
    RMDStrategy: [],
    RothConversionOpt: false,
    RothConversionStart: null,
    RothConversionEnd: null,
    RothConversionStrategy: [],
    financialGoal: null,
    residenceState: "",
  };

  // Use default values when retrieving data from localStorage
  const [scenarioData] = useState(() => {
    const savedData = localStorage.getItem("ScenarioData");
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.error("Error parsing scenarioData:", e);
        return defaultScenarioData;
      }
    }
    return defaultScenarioData;
  });

  const [inflationRate, setInflationRate] = useState(() =>
    scenarioData.inflationAssumption.value
      ? scenarioData.inflationAssumption.value * 100
      : null
  );
  const [contributionLimit, setContributionLimit] = useState(
    () => Number(scenarioData.afterTaxContributionLimit) || null
  );
  const [rothOpt, setRothOpt] = useState(
    () => scenarioData.RothConversionOpt ?? false
  );
  const [rothStart, setRothStart] = useState(
    () => Number(scenarioData.RothConversionStart) || null
  );
  const [rothEnd, setRothEnd] = useState(
    () => Number(scenarioData.RothConversionEnd) || null
  );
  const [financialGoals, setFinancialGoals] = useState(
    () => Number(scenarioData.financialGoal) || null
  );
  const [livingState, setLivingState] = useState(
    () => scenarioData.residenceState ?? ""
  );

  const preTaxInvestments = data.investments
    .filter((inv) => inv.taxStatus === "pre-tax")
    .map((inv) => inv.id);

  const discreteEvents = data.eventSeries
    .filter((event) => event.discretionary === true)
    .map((event) => event.name);

  const allInvestments = data.investments.map((inv) => inv.id);

  const [spendingStrategy, setSpendingStrategy] = useState(
    () => scenarioData.spendingStrategy ?? []
  );
  const [withdrawalStrategy, setWithdrawalStrategy] = useState(
    () => scenarioData.expenseWithdrawalStrategy ?? []
  );
  const [RMDStrategy, setRMDStrategy] = useState(
    () => scenarioData.RMDStrategy ?? []
  );
  const [rothStrategy, setRothStrategy] = useState(
    () => scenarioData.RothConversionStrategy ?? []
  );

  // spending modal 상태
  const [showSpendingModal, setShowSpendingModal] = useState(false);
  const [modalSpendingSelect, setModalSpendingSelect] = useState(
    discreteEvents.length ? discreteEvents[0] : ""
  );
  const [modalSpendingList, setModalSpendingList] = useState([]);

  // withdrawal modal 상태
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [modalWithdrawalSelect, setModalWithdrawalSelect] = useState(
    allInvestments.length ? allInvestments[0] : ""
  );
  const [modalWithdrawalList, setModalWithdrawalList] = useState([]);

  // RMD modal 상태
  const [showRMDModal, setShowRMDModal] = useState(false);
  const [modalRMDSelect, setModalRMDSelect] = useState(
    preTaxInvestments.length ? preTaxInvestments[0] : ""
  );
  const [modalRMDList, setModalRMDList] = useState([]);

  // Roth Conversion Strategy modal 상태
  const [showRothModal, setShowRothModal] = useState(false);
  const [modalRothSelect, setModalRothSelect] = useState(
    preTaxInvestments.length ? preTaxInvestments[0] : ""
  );
  const [modalRothList, setModalRothList] = useState([]);

  // Modal 핸들러
  const openSpendingModal = () => {
    setModalSpendingList(spendingStrategy);
    setModalSpendingSelect(spendingStrategy[0] || discreteEvents[0] || "");
    setShowSpendingModal(true);
  };
  const closeSpendingModal = () => setShowSpendingModal(false);
  const confirmSpending = () => {
    if (modalSpendingList.length === 0) {
      toast.warning("Select at least one element");
      return;
    }
    setSpendingStrategy(modalSpendingList);
    closeSpendingModal();
  };
  const addSpendingItem = () => {
    if (
      modalSpendingSelect &&
      !modalSpendingList.includes(modalSpendingSelect)
    ) {
      setModalSpendingList([...modalSpendingList, modalSpendingSelect]);
    }
  };

  const openWithdrawalModal = () => {
    setModalWithdrawalList(withdrawalStrategy);
    setModalWithdrawalSelect(withdrawalStrategy[0] || allInvestments[0] || "");
    setShowWithdrawalModal(true);
  };
  const closeWithdrawalModal = () => setShowWithdrawalModal(false);
  const confirmWithdrawal = () => {
    if (modalWithdrawalList.length === 0) {
      toast.warning("Select at least one element");
      return;
    }
    setWithdrawalStrategy(modalWithdrawalList);
    closeWithdrawalModal();
  };
  const addWithdrawalItem = () => {
    if (
      modalWithdrawalSelect &&
      !modalWithdrawalList.includes(modalWithdrawalSelect)
    ) {
      setModalWithdrawalList([...modalWithdrawalList, modalWithdrawalSelect]);
    }
  };

  const openRMDModal = () => {
    setModalRMDList(RMDStrategy);
    setModalRMDSelect(RMDStrategy[0] || preTaxInvestments[0] || "");
    setShowRMDModal(true);
  };
  const closeRMDModal = () => setShowRMDModal(false);
  const confirmRMD = () => {
    if (modalRMDList.length === 0) {
      toast.warning("Select at least one element");
      return;
    }
    setRMDStrategy(modalRMDList);
    closeRMDModal();
  };
  const addRMDItem = () => {
    if (modalRMDSelect && !modalRMDList.includes(modalRMDSelect)) {
      setModalRMDList([...modalRMDList, modalRMDSelect]);
    }
  };

  const openRothModal = () => {
    setModalRothList(rothStrategy);
    setModalRothSelect(rothStrategy[0] || preTaxInvestments[0] || "");
    setShowRothModal(true);
  };
  const closeRothModal = () => setShowRothModal(false);
  const confirmRoth = () => {
    if (modalRothList.length === 0) {
      toast.warning("Select at least one element");
      return;
    }
    setRothStrategy(modalRothList);
    closeRothModal();
  };
  const addRothItem = () => {
    if (modalRothSelect && !modalRothList.includes(modalRothSelect)) {
      setModalRothList([...modalRothList, modalRothSelect]);
    }
  };

  const navigate = useNavigate();

  const handleBack = (e) => {
    e.preventDefault();
    navigate(`${constPath.overview}`);
  };

  const handleStartSimulation = async (e) => {
    e.preventDefault();

    if (rothOpt && rothStrategy.length === 0) {
      toast.error("Please enter the Roth conversion strategy");
      return;
    }

    if (rothOpt && (rothStart !== null || rothEnd === null)) {
      toast.error("Please enter the Roth conversion years");
      return;
    }
    const simulationInfo = {
      inflationAssumption: { type: "fixed", value: inflationRate / 100 },
      afterTaxContributionLimit: contributionLimit,
      spendingStrategy: spendingStrategy,
      expenseWithdrawalStrategy: withdrawalStrategy,
      RMDStrategy: RMDStrategy,
      RothConversionOpt: rothOpt,
      RothConversionStart: rothStart,
      RothConversionEnd: rothEnd,
      RothConversionStrategy: rothStrategy,
      financialGoal: financialGoals,
      residenceState: livingState,
    };

    const basicSettingData = JSON.parse(localStorage.getItem("BasicSettings"));
    const emailAddr = sessionStorage.getItem("userEmail");

    const combinedData = {
      ...basicSettingData,
      ...simulationInfo,
    };

    localStorage.setItem("ScenarioData", JSON.stringify(combinedData));

    console.log("Sending data to server:", combinedData);
    try {
      // Send scenario data to server
      if (simulationInfo.residenceState !== "NY" || simulationInfo.residenceState !== "NJ" || simulationInfo.residenceState !== "CT") {
        toast.error("Please upload the state tax file");
      }

      const response = await fetch(
        `${process.env.REACT_APP_LFP_API_URL}/api/run-simulation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ yamlText: combinedData, userEmail: emailAddr, scenarioName: basicSettingData.name }),
        }
      );

      console.log("Server response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      const responseText = await response.text();
      console.log("Raw response:", responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        throw new Error(`Server response is not valid JSON: ${responseText}`);
      }

      console.log("Parsed response:", result);
      localStorage.setItem("simResult", JSON.stringify(result));

      if (!response.ok) {
        throw new Error(
          `Failed to run simulation: ${result.error || responseText}`
        );
      }
      navigate(`${constPath.overview}`);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "An error occurred");
    }
  };

  return (
    <div className="SimulationInfo">
      <h2 style={{ textAlign: "center", color: "white" }}>
        Information for Predict your Finance
      </h2>
      <div className="infoSection">
        <h3 style={{ textAlign: "center" }}>What is Predict your Finance?</h3>
        <p style={{ textAlign: "center", fontSize: "13px", color: "#444" }}>
          Predict your Finance is a simulation tool that helps you understand
          the impact of different financial decisions on your future. It allows
          you to input various parameters and see how they affect your financial
          situation over time.
        </p>
        <section title="Inflation & Contribution">
          <section className="Inflation">
            <label>
              Inflation Rate
              <input
                type="number"
                placeholder="e.g. 3"
                value={inflationRate}
                onChange={(e) => setInflationRate(e.target.value)}
              />{" "}
              %
            </label>
          </section>
          <section className="Contribution">
            <label>
              Tax-Free Retirement Account Annual Contribution Limit
              <input
                type="number"
                placeholder="e.g. 500"
                value={contributionLimit || ""}
                onChange={(e) => setContributionLimit(e.target.value === "" ? null : Number(e.target.value))}
              />{" "}
              $
            </label>
          </section>
        </section>
        <section title="Spending & Withdrawal">
          <section className="Spending">
            {/* 이전에 유저가 작성했던 eventSeries에서 데이터를 불러올 것 
                        이 부분을 Add 버튼을 생성해서 모달 팝업을 띄운 뒤, 모달 팝업 내에서
                        유저가 입력한 데이터를 띄우고 선택해서 배열에 저장이 되게 하고,
                        이후에 confirm 버튼을 누르면 그 데이터가 저장이 되고 add버튼 옆에
                        체크 표시가 되게 설계 */}
            <label>
              Spending Strategy
              {spendingStrategy.length > 0 ? (
                <span>
                  ✓ Checked
                  <button className="addButton" onClick={openSpendingModal}>
                    Modify
                  </button>
                </span>
              ) : (
                <button className="addButton" onClick={openSpendingModal}>
                  Add
                </button>
              )}
            </label>
            {showSpendingModal && (
              <div className="modalOverlay" onClick={closeSpendingModal}>
                <div
                  className="modalContent"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h4>Select Spending Options</h4>
                  <div className="modalControls">
                    <select
                      value={modalSpendingSelect}
                      onChange={(e) => setModalSpendingSelect(e.target.value)}
                    >
                      <option value="">-- Select spend type --</option>
                      {discreteEvents.map((item, idx) => (
                        <option key={idx} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <button className="addButton" onClick={addSpendingItem}>
                      Add
                    </button>
                  </div>
                  <ul className="modalList">
                    {modalSpendingList.map((name, i) => (
                      <li key={i}>{name}</li>
                    ))}
                  </ul>
                  <div className="modalButtons">
                    <button
                      className="cancelButton"
                      onClick={closeSpendingModal}
                    >
                      Cancel
                    </button>
                    <button className="addButton" onClick={confirmSpending}>
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
          <section className="Withdrawal">
            {/* Add 버튼을 생성해서 모달 팝업을 띄운 뒤, 모달 팝업 내에서
                        유저가 입력한 데이터를 띄우고 선택해서 배열에 저장이 되게 하고,
                        이후에 confirm 버튼을 누르면 그 데이터가 저장이 되고 add버튼 옆에
                        체크 표시가 되게 설계 */}
            <label>
              Withdrawal Strategy
              {withdrawalStrategy.length > 0 ? (
                <span>
                  ✓ Checked
                  <button className="addButton" onClick={openWithdrawalModal}>
                    Modify
                  </button>
                </span>
              ) : (
                <button className="addButton" onClick={openWithdrawalModal}>
                  Add
                </button>
              )}
            </label>
            {showWithdrawalModal && (
              <div className="modalOverlay" onClick={closeWithdrawalModal}>
                <div
                  className="modalContent"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h4>Select Withdrawal Options</h4>
                  <div className="modalControls">
                    <select
                      value={modalWithdrawalSelect}
                      onChange={(e) => setModalWithdrawalSelect(e.target.value)}
                    >
                      {allInvestments.map((item, idx) => (
                        <option key={idx} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <button className="addButton" onClick={addWithdrawalItem}>
                      Add
                    </button>
                  </div>
                  <ul className="modalList">
                    {modalWithdrawalList.map((name, i) => (
                      <li key={i}>{name}</li>
                    ))}
                  </ul>
                  <div className="modalButtons">
                    <button
                      className="cancelButton"
                      onClick={closeWithdrawalModal}
                    >
                      Cancel
                    </button>
                    <button className="addButton" onClick={confirmWithdrawal}>
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </section>
        <section
          title="RMD Strategy & Enable Roth Conversion"
          className="RothOpt"
        >
          <section className="RMDRoth">
            {/* Add 버튼을 생성해서 모달 팝업을 띄운 뒤, 모달 팝업 내에서
                        유저가 입력한 데이터를 띄우고 선택해서 배열에 저장이 되게 하고,
                        이후에 confirm 버튼을 누르면 그 데이터가 저장이 되고 add버튼 옆에
                        체크 표시가 되게 설계 */}
            <label>
              Source for Required Minimum Distributions (RMDs)
              {RMDStrategy.length > 0 ? (
                <span>
                  ✓ Checked
                  <button className="addButton" onClick={openRMDModal}>
                    Modify
                  </button>
                </span>
              ) : (
                <button className="addButton" onClick={openRMDModal}>
                  Add
                </button>
              )}
            </label>
            {showRMDModal && (
              <div className="modalOverlay" onClick={closeRMDModal}>
                <div
                  className="modalContent"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h4>Select RMD Options</h4>
                  <div className="modalControls">
                    <select
                      value={modalRMDSelect}
                      onChange={(e) => setModalRMDSelect(e.target.value)}
                    >
                      {preTaxInvestments.map((item, idx) => (
                        <option key={idx} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <button className="addButton" onClick={addRMDItem}>
                      Add
                    </button>
                  </div>
                  <ul className="modalList">
                    {modalRMDList.map((name, i) => (
                      <li key={i}>{name}</li>
                    ))}
                  </ul>
                  <div className="modalButtons">
                    <button className="cancelButton" onClick={closeRMDModal}>
                      Cancel
                    </button>
                    <button className="addButton" onClick={confirmRMD}>
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
          <label>
            Optimaize Roth Conversions?
            <input
              id="rothOpt"
              type="checkbox"
              checked={rothOpt}
              onChange={(e) => setRothOpt(e.target.checked)}
              className="rothCheckbox"
            />
          </label>
        </section>
        <section title="Roth Conversion Start & End" className="RothStart">
          <label>
            Roth Conversion Year: From
            <input
              type="number"
              placeholder="e.g. 2050"
              value={rothStart || ""}
              onChange={(e) => setRothStart(e.target.value === "" ? null : Number(e.target.value))}
            />
            <span style={{ marginLeft: "20px" }}>To</span>
            <input
              type="number"
              placeholder="e.g. 2060"
              value={rothEnd || ""}
              onChange={(e) => setRothEnd(e.target.value === "" ? null : Number(e.target.value))}
            />
          </label>
        </section>
        <section title="Roth Conversion Strategy" className="RothStrategy">
          {/* Investments에서 데이터 불러올 것 
                    이후, 유저가 선택하는데로 배열에 저장이 되게끔 설계 */}
          <label>
            Roth Conversion Strategy
            {rothStrategy.length > 0 ? (
              <span>
                ✓ Checked
                <button className="addButton" onClick={openRothModal}>
                  Modify
                </button>
              </span>
            ) : (
              <button className="addButton" onClick={openRothModal}>
                Add
              </button>
            )}
          </label>
          {showRothModal && (
            <div className="modalOverlay" onClick={closeRothModal}>
              <div
                className="modalContent"
                onClick={(e) => e.stopPropagation()}
              >
                <h4>Select Roth Conversion Options</h4>
                <div className="modalControls">
                  <select
                    value={modalRothSelect}
                    onChange={(e) => setModalRothSelect(e.target.value)}
                  >
                    {preTaxInvestments.map((item, idx) => (
                      <option key={idx} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <button className="addButton" onClick={addRothItem}>
                    Add
                  </button>
                </div>
                <ul className="modalList">
                  {modalRothList.map((name, i) => (
                    <li key={i}>{name}</li>
                  ))}
                </ul>
                <div className="modalButtons">
                  <button className="cancelButton" onClick={closeRothModal}>
                    Cancel
                  </button>
                  <button className="addButton" onClick={confirmRoth}>
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
        <section
          title="Financial Goals & Living State"
          className="FinancialGoals"
        >
          <label>
            Financial Goals
            <input
              type="number"
              placeholder="e.g. 10000"
              value={financialGoals || ""}
              onChange={(e) => setFinancialGoals(e.target.value === "" ? null : Number(e.target.value))}
            />
          </label>
          <span style={{ marginLeft: "10px", marginRight: "40px" }}>$</span>
          <label>
            Living State
            <input
              type="text"
              placeholder="e.g. NY"
              value={livingState}
              onChange={(e) => setLivingState(e.target.value)}
            />
          </label>
        </section>
        <section title="State tax">
          <h4>Upload State Tax</h4>
          <p style={{ textAlign: "center", fontSize: "13px", color: "#444" }}>
            Upload the state tax file to use in the simulation.{" "}
          </p>
          <p>The file should be in the correct format.</p>
          <p>Example:</p>
          <p>NY:</p>
          <p>name: "New York Tax"</p>
          <p>socialsecurity: true</p>
          <p>year: 2024</p>
          <p>
            individual:
            {`{"8500": 0.04, "11700": 0.045, "13900": 0.0525, "80650":0.055, "215400":0.06, "1077550":0.0685, "5000000": 0.0965, "25000000": 0.103, "inf": 0.109}`}
          </p>
          <p>
            couple:
            {`{"17150": 0.04, "23600": 0.045, "27900": 0.0525, "161550":0.055, "323200":0.06, "2155350":0.0685, "5000000": 0.0965, "25000000": 0.103, "inf": 0.109}`}
          </p>

          <TaxFileImport />
        </section>
        <div className="form-buttons">
          <button className="back" onClick={handleBack}>
            Back
          </button>
          <button className="next" onClick={handleStartSimulation}>
            Start Simulation
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimulationInfo;
