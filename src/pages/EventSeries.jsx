import React, { useState, useEffect } from "react";
import "./EventSeries.css";
import { constPath } from "../config.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import trashIcon from "../assets/trash.svg";

const EventSeries = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleBack = (e) => {
    e.preventDefault();
    navigate(-1);
  };

  const handleNext = async (e) => {
    e.preventDefault();
    
    // Gahtering data from localStorage
    const basicInfo = JSON.parse(localStorage.getItem("basicInfo") || "{}");
    const investmentType = JSON.parse(localStorage.getItem("InvestmentTypes") || "{}");
    const investments = JSON.parse(localStorage.getItem("Investments") || "{}");
    const eventSeries = JSON.parse(localStorage.getItem("EventSeries") || "[]");

    if (!basicInfo.name) {
      toast.error("Scenario name is required in Basic Settings");
      return;
    }

    // Merge all data into one object (flattened basicInfo)
    // flatten basicInfo to make sure it looks similar to the sample scenario.yaml
    const combinedData = {
      ...basicInfo,
      investmentType,
      investments,
      eventSeries
    };

    try {
      // Send scenario data to server
      const response = await fetch("/api/save-scenario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(combinedData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save scenario: ${errorText}`);
      }

      const result = await response.json();
      console.log("Scenario saved:", result.filePath);

      const simResponse = await fetch(`/api/run-simulation?email=${encodeURIComponent(result.email)}&scenarioName=${encodeURIComponent(result.scenarioName)}`, {
        credentials: "include"
      });

      if (!simResponse.ok) {
        const errorText = await simResponse.text();
        throw new Error(`Failed to run simulation: ${errorText}`);
      }

      let simResult;
      const contentType = simResponse.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        simResult = await simResponse.json();
        console.log("Simulation completed:", simResult.output);
        // Save the result of simulation to localStorage
        localStorage.setItem("simulationResult", simResult.output);
      } else {
        const textResult = await simResponse.text();
        console.log("Simulation completed with text response:", textResult);
        localStorage.setItem("simulationResult", textResult);
      }

      // Go to overview page
      navigate(`${constPath.overview}`);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "An error occurred");
    }
  };

  //--------------------------------------------------------------------------------------------------
  const eventTypes = ["income", "expense", "invest", "rebalance"];

  // storing data for allocation1
  const [selectInvestment, setSelectInvestment] = useState("");
  const [allocationNum, setAllocationNum] = useState("");

  //storing data for allocation2
  const [selectInvestment2, setSelectInvestment2] = useState("");
  const [allocationNum2, setAllocationNum2] = useState("");
  // Investments 데이터를 로컬스토리지에서 불러와 JSON으로 파싱한 후, 각 Investment의 id로 구성된 배열 생성
  const investmentsData = JSON.parse(
    localStorage.getItem("Investments") || "[]"
  );
  const assetAllocations = investmentsData.map((investment) => investment.id);

  // initial event status
  const initialEvent = {
    name: "",
    start: {
      type: "fixed",
      value: 0,
      eventSeries: "selectedIncomeId",
      lower: 0,
      upper: 0,
    },
    duration: { type: "fixed", value: 0 },
    type: "",
    initialAmount: null,
    changeAmtOrPct: "",
    changeDistribution: {
      type: "uniform",
      lower: 0,
      upper: 0,
      mean: 0.0,
      stdev: 0.0,
    },
    inflationAdjusted: false,
    userFranction: null,
    socialSecurity: false,
    assetAllocation: {},
    glidePath: false,
    assetAllocation2: {},
    maxCash: null,
    discretionary: false,
  };

  const [newEvent, setNewEvent] = useState(initialEvent);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  // add the list when click confirm
  const handleConfirm = () => {
    if (!newEvent.name) {
      toast.warning("Please Fill in all fields");
      return;
    }

    // max cash to 1000
    if (newEvent.maxCash > 1000) {
      toast.warning("Cash cannot exceed 1000.");
      return;
    }

    const updatedList = [...events, newEvent];
    setEvents(updatedList);

    localStorage.setItem("EventSeries", JSON.stringify(updatedList));

    setEvents([...events, newEvent]);
    setNewEvent(initialEvent);
    closeModal();
  };

  const handleDelete = (index) => {
    const updated = events.filter((_, i) => i !== index);
    setEvents(updated);
    localStorage.setItem("EventSeries", JSON.stringify(updated));
  };

  useEffect(() => {
    const savedList = localStorage.getItem("EventSeries");
    if (savedList) {
      setEvents(JSON.parse(savedList));
    }

    const savedEventSeries = localStorage.getItem("EventSeries");
    if (savedEventSeries) {
      setEvents(JSON.parse(savedEventSeries));
    }
  }, []);

  const incomeEvents = events.filter((event) => event.type === "income");

  return (
    <div className="eventSeries-container">
      <div className="topbar"></div>
      <h2 style={{ textAlign: "center", color: "white" }}>
        Event Series Setting
      </h2>
      <div className="eventseries-wrapper">
        <p style={{ color: "#888888" }}>
          You can enter information about your income, expenses, investments,
          etc.
        </p>
        <button className="add-btn" onClick={openModal}>
          add event
        </button>

        {events.map((event, idx) => (
          <div key={idx} className="event-item">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <strong>{event.name}</strong> ({event.type})
              </div>
              <img
                src={trashIcon}
                alt="delete"
                className="trash-icon"
                onClick={() => handleDelete(idx)}
              />
            </div>
            {/* Prompt to ChatGPT: "How can I export the input format depending on the type? For example, if user choose Income, it export start Year, Duration, Amount. However, if user choose invest, then it should export start year, duration, assestAllocation, gildepath, and cash" */}
            {event.type === "income" || event.type === "expense" ? (
              <div>
                <div>Start Year: {event.start}</div>
                <div>Duration: {event.duration} year(s)</div>
              </div>
            ) : event.type === "invest" || event.type === "rebalance" ? (
              <div>
                <div>Start Year: {event.start}</div>
                <div>Duration: {event.duration} year(s)</div>
              </div>
            ) : (
              /* rebalance */
              <div> (No extra fields) </div>
            )}
          </div>
        ))}

        {/* modal popup */}
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h4>Add Event Series</h4>

              {/* 1) Event Name */}
              <label>Event Name</label>
              <input
                type="text"
                value={newEvent.name}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, name: e.target.value })
                }
              />

              {/* 2) Event Type */}
              <label>What is the type of?</label>
              <select
                value={newEvent.type}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, type: e.target.value })
                }
              >
                <option value="">-- Select Type --</option>
                {eventTypes.map((type, idx) => (
                  <option key={idx} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              {/* income -> Start Year, Duration, Amount */}
              {newEvent.type === "income" && (
                <>
                  <label>start Year</label>
                  <input
                    type="number"
                    placeholder="e.g. 2025"
                    value={newEvent.start}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        start: parseInt(e.target.value, 10),
                      })
                    }
                  />
                  <label>Duration for years</label>
                  <input
                    type="number"
                    placeholder="e.g. 20"
                    value={newEvent.duration}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        duration: parseInt(e.target.value, 10),
                      })
                    }
                  />
                  <label>Amount</label>
                  <input
                    type="number"
                    placeholder="e.g. 1234"
                    value={newEvent.initialAmount}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        initialAmount: parseFloat(e.target.value, 10),
                      })
                    }
                  />
                  <label>Amount change trend</label>
                  <select
                    value={newEvent.changeAmtOrPct}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        changeAmtOrPct: e.target.value,
                      })
                    }
                  >
                    <option value="amount">Notation for Amount</option>
                    <option value="percent">Notation for Percent</option>
                  </select>
                  {/* If user select Amount */}
                  <input
                    style={{ width: "150px" }}
                    type="number"
                    placeholder="e.g. 1234"
                    value={
                      newEvent.changeAmtOrPct === "amount"
                        ? newEvent.changeDistribution.lower || null
                        : newEvent.changeDistribution.mean || null
                    }
                    onChange={(e) => {
                      const value = parseFloat(e.target.value, 10);
                      if (newEvent.changeAmtOrPct === "amount") {
                        setNewEvent({
                          ...newEvent,
                          changeDistribution: {
                            ...newEvent.changeDistribution,
                            lower: value,
                          },
                        });
                      } else {
                        setNewEvent({
                          ...newEvent,
                          changeDistribution: {
                            ...newEvent.changeDistribution,
                            mean: value,
                          },
                        });
                      }
                    }}
                  />{" "}
                  ~
                  <input
                    style={{ width: "150px" }}
                    type="number"
                    placeholder="e.g. 5678"
                    value={
                      newEvent.changeAmtOrPct === "amount"
                        ? newEvent.changeDistribution.upper || ""
                        : newEvent.changeDistribution.stdev || ""
                    }
                    onChange={(e) => {
                      const value = parseFloat(e.target.value, 10);
                      if (newEvent.changeAmtOrPct === "amount") {
                        setNewEvent({
                          ...newEvent,
                          changeDistribution: {
                            ...newEvent.changeDistribution,
                            upper: value,
                          },
                        });
                      } else {
                        setNewEvent({
                          ...newEvent,
                          changeDistribution: {
                            ...newEvent.changeDistribution,
                            stdev: value,
                          },
                        });
                      }
                    }}
                  />
                  <label>Is it inflation adjusted?</label>
                  <input
                    type="checkbox"
                    checked={newEvent.inflationAdjusted}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        inflationAdjusted: e.target.checked,
                      })
                    }
                  />
                  <br />
                  <label>
                    What is your share ratio?
                    <span style={{ fontSize: "11px" }}>
                      (If you do not have a spouse, please indicate 1.0)
                    </span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 0.3"
                    value={newEvent.userFranction}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        userFranction: parseFloat(e.target.value, 10),
                      })
                    }
                  />
                  <label>Is it social Security?</label>
                  <input
                    type="checkbox"
                    checked={newEvent.socialSecurity}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        socialSecurity: e.target.checked,
                      })
                    }
                  />
                </>
              )}

              {/* Expense Part */}
              {newEvent.type === "expense" && (
                <>
                  <label>Start Year with:</label>
                  <select
                    value={newEvent.start.eventSeries || ""}
                    onChange={(e) => {
                      const selectedIncomeId = e.target.value;
                      // 선택한 income 이벤트를 찾기 (고유 id로)
                      const selectedIncome = incomeEvents.find(
                        (income) => income.id === selectedIncomeId
                      );
                      // income 이벤트가 존재하면 그 start 연도를 가져옴
                      setNewEvent({
                        ...newEvent,
                        start: {
                          type: "startWith",
                          eventSeries: selectedIncomeId,
                          value: selectedIncome
                            ? selectedIncome.start.value
                            : null,
                        },
                      });
                    }}
                  >
                    <option value="">-- Select Income Event --</option>
                    {incomeEvents.map((income) => (
                      <option key={income.id} value={income.id}>
                        {income.name} ({income.start.value})
                      </option>
                    ))}
                  </select>
                  <label>Amount</label>
                  <input
                    type="number"
                    placeholder="e.g. 1234"
                    value={newEvent.initialAmount}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        initialAmount: parseFloat(e.target.value, 10),
                      })
                    }
                  />
                  <label>Amount change trend</label>
                  <select
                    value={newEvent.changeAmtOrPct}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        changeAmtOrPct: e.target.value,
                      })
                    }
                  >
                    <option value="amount">Notation for Amount</option>
                    <option value="percent">Notation for Percent</option>
                  </select>
                  {/* If user select Amount */}
                  <input
                    style={{ width: "150px" }}
                    type="number"
                    placeholder="e.g. 1234"
                    value={
                      newEvent.changeAmtOrPct === "amount"
                        ? newEvent.changeDistribution.lower || null
                        : newEvent.changeDistribution.mean || null
                    }
                    onChange={(e) => {
                      const value = parseFloat(e.target.value, 10);
                      if (newEvent.changeAmtOrPct === "amount") {
                        setNewEvent({
                          ...newEvent,
                          changeDistribution: {
                            ...newEvent.changeDistribution,
                            lower: value,
                          },
                        });
                      } else {
                        setNewEvent({
                          ...newEvent,
                          changeDistribution: {
                            ...newEvent.changeDistribution,
                            mean: value,
                          },
                        });
                      }
                    }}
                  />{" "}
                  ~
                  <input
                    style={{ width: "150px" }}
                    type="number"
                    placeholder="e.g. 5678"
                    value={
                      newEvent.changeAmtOrPct === "amount"
                        ? newEvent.changeDistribution.upper || ""
                        : newEvent.changeDistribution.stdev || ""
                    }
                    onChange={(e) => {
                      const value = parseFloat(e.target.value, 10);
                      if (newEvent.changeAmtOrPct === "amount") {
                        setNewEvent({
                          ...newEvent,
                          changeDistribution: {
                            ...newEvent.changeDistribution,
                            upper: value,
                          },
                        });
                      } else {
                        setNewEvent({
                          ...newEvent,
                          changeDistribution: {
                            ...newEvent.changeDistribution,
                            stdev: value,
                          },
                        });
                      }
                    }}
                  />
                  <label>Is it inflation adjusted?</label>
                  <input
                    type="checkbox"
                    checked={newEvent.inflationAdjusted}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        inflationAdjusted: e.target.checked,
                      })
                    }
                  />
                  <br />
                  <label>
                    What is your share ratio?
                    <span style={{ fontSize: "11px" }}>
                      (If you do not have a spouse, please indicate 1.0)
                    </span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 0.3"
                    value={newEvent.userFranction}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        userFranction: parseFloat(e.target.value, 10),
                      })
                    }
                  />
                  <label>Is it discretionary?</label>
                  <input
                    type="checkbox"
                    checked={newEvent.discretionary}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        discretionary: e.target.checked,
                      })
                    }
                  />
                </>
              )}

              {/* invest -> Start Year, Duration, assetAllocation, glidePath, assetAllocation2, maxCash */}
              {newEvent.type === "invest" && (
                <>
                  <label>Year range:</label>
                  <input
                    type="number"
                    placeholder="Start Year"
                    value={newEvent.start.lower}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        start: parseInt(e.target.value, 10),
                      })
                    }
                  />{" "}
                  ~
                  <input
                    type="number"
                    placeholder="End Year (Expected)"
                    value={newEvent.start.upper}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        start: parseInt(e.target.value, 10),
                      })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Duration (year)"
                    value={newEvent.duration}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        duration: parseInt(e.target.value, 10),
                      })
                    }
                  />
                  <label>Asset Allocation (%) </label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <select
                      value={selectInvestment}
                      onChange={(e) => setSelectInvestment(e.target.value)}
                    >
                      <option value="">-- Select --</option>
                      {assetAllocations.map((alloc, idx) => (
                        <option key={idx} value={alloc}>
                          {alloc}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="e.g. 0.4"
                      value={allocationNum}
                      onChange={(e) => setAllocationNum(e.target.value, 10)}
                      style={{ width: "50px" }}
                    />
                    <button
                      onClick={() => {
                        // 값이 모두 입력되어 있다면, assetAllocation 객체에 추가
                        if (selectInvestment && allocationNum) {
                          const allocationValue = parseFloat(allocationNum);
                          setNewEvent({
                            ...newEvent,
                            assetAllocation: {
                              // 기존 assetAllocation 값을 유지하면서 새 항목 추가
                              ...newEvent.assetAllocation,
                              [selectInvestment]: allocationValue,
                            },
                          });
                          // 입력값 초기화
                          setSelectInvestment("");
                          setAllocationNum("");
                        }
                      }}
                    >
                      Add
                    </button>
                  </div>
                  {/* 추가된 assetAllocation 목록 표시 */}
                  <div style={{ marginTop: "10px" }}>
                    <h5>Asset Allocations:</h5>
                    <ul>
                      {newEvent.assetAllocation &&
                        Object.entries(newEvent.assetAllocation).map(
                          ([asset, allocation]) => (
                            <li key={asset}>
                              {asset}: {allocation}{" "}
                              <button
                                onClick={() => {
                                  // asset 삭제 처리: 해당 key를 제거한 새로운 객체를 생성
                                  const { [asset]: _, ...rest } =
                                    newEvent.assetAllocation;
                                  setNewEvent({
                                    ...newEvent,
                                    assetAllocation: rest,
                                  });
                                }}
                              >
                                Remove
                              </button>
                            </li>
                          )
                        )}
                    </ul>
                  </div>
                  <label>
                    Glide Path:
                    <input
                      type="checkbox"
                      checked={newEvent.glidePath}
                      onChange={(e) =>
                        setNewEvent({
                          ...newEvent,
                          glidePath: e.target.checked,
                          // if release glidePath, then reset assetAllocation2
                          ...(e.target.checked === false
                            ? { assetAllocation2: "" }
                            : {}),
                        })
                      }
                    />
                  </label>
                  {/* If glidePath checked */}
                  {newEvent.glidePath && (
                    <>
                      <label>Asset Allocation2</label>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <select
                          value={selectInvestment2}
                          onChange={(e) => setSelectInvestment2(e.target.value)}
                        >
                          <option value="">-- Select --</option>
                          {assetAllocations.map((alloc, idx) => (
                            <option key={idx} value={alloc}>
                              {alloc}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          placeholder="e.g. 0.4"
                          value={allocationNum2}
                          onChange={(e) => setAllocationNum2(e.target.value, 10)}
                          style={{ width: "50px" }}
                        />
                        <button
                          onClick={() => {
                            // 값이 모두 입력되어 있다면, assetAllocation 객체에 추가
                            if (selectInvestment2 && allocationNum2) {
                              const allocationValue = parseFloat(allocationNum2);
                              setNewEvent({
                                ...newEvent,
                                assetAllocation2: {
                                  // 기존 assetAllocation 값을 유지하면서 새 항목 추가
                                  ...newEvent.assetAllocation2,
                                  [selectInvestment2]: allocationValue,
                                },
                              });
                              // 입력값 초기화
                              setSelectInvestment("");
                              setAllocationNum("");
                            }
                          }}
                        >
                          Add
                        </button>
                      </div>
                      {/* 추가된 assetAllocation 목록 표시 */}
                      <div style={{ marginTop: "10px" }}>
                        <h5>Asset Allocations2:</h5>
                        <ul>
                          {newEvent.assetAllocation2 &&
                            Object.entries(newEvent.assetAllocation2).map(
                              ([asset, allocation]) => (
                                <li key={asset}>
                                  {asset}: {allocation}{" "}
                                  <button
                                    onClick={() => {
                                      // asset 삭제 처리: 해당 key를 제거한 새로운 객체를 생성
                                      const { [asset]: _, ...rest } =
                                        newEvent.assetAllocation2;
                                      setNewEvent({
                                        ...newEvent,
                                        assetAllocation2: rest,
                                      });
                                    }}
                                  >
                                    Remove
                                  </button>
                                </li>
                              )
                            )}
                        </ul>
                      </div>
                    </>
                  )}
                  <label>Cash (Max 1000)</label>
                  <input
                    type="number"
                    placeholder="0 ~ 1000"
                    value={newEvent.maxCash}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setNewEvent({ ...newEvent, maxCash: val });
                    }}
                  />
                </>
              )}

              {/* For rebalance */}
              {newEvent.type === "rebalance" && (
                <>
                  <label>Year range:</label>
                  <input
                    type="number"
                    placeholder="Start Year"
                    value={newEvent.start.lower}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        start: parseInt(e.target.value, 10),
                      })
                    }
                  />{" "}
                  ~
                  <input
                    type="number"
                    placeholder="End Year (Expected)"
                    value={newEvent.start.upper}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        start: parseInt(e.target.value, 10),
                      })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Duration (year)"
                    value={newEvent.duration}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        duration: parseInt(e.target.value, 10),
                      })
                    }
                  />
                  <label>Asset Allocation (%) </label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <select
                      value={selectInvestment}
                      onChange={(e) => setSelectInvestment(e.target.value)}
                    >
                      <option value="">-- Select --</option>
                      {assetAllocations.map((alloc, idx) => (
                        <option key={idx} value={alloc}>
                          {alloc}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="e.g. 0.4"
                      value={allocationNum}
                      onChange={(e) => setAllocationNum(e.target.value, 10)}
                      style={{ width: "50px" }}
                    />
                    <button
                      onClick={() => {
                        // 값이 모두 입력되어 있다면, assetAllocation 객체에 추가
                        if (selectInvestment && allocationNum) {
                          const allocationValue = parseFloat(allocationNum);
                          setNewEvent({
                            ...newEvent,
                            assetAllocation: {
                              // 기존 assetAllocation 값을 유지하면서 새 항목 추가
                              ...newEvent.assetAllocation,
                              [selectInvestment]: allocationValue,
                            },
                          });
                          // 입력값 초기화
                          setSelectInvestment("");
                          setAllocationNum("");
                        }
                      }}
                    >
                      Add
                    </button>
                  </div>
                  {/* 추가된 assetAllocation 목록 표시 */}
                  <div style={{ marginTop: "10px" }}>
                    <h5>Asset Allocations:</h5>
                    <ul>
                      {newEvent.assetAllocation &&
                        Object.entries(newEvent.assetAllocation).map(
                          ([asset, allocation]) => (
                            <li key={asset}>
                              {asset}: {allocation}{" "}
                              <button
                                onClick={() => {
                                  // asset 삭제 처리: 해당 key를 제거한 새로운 객체를 생성
                                  const { [asset]: _, ...rest } =
                                    newEvent.assetAllocation;
                                  setNewEvent({
                                    ...newEvent,
                                    assetAllocation: rest,
                                  });
                                }}
                              >
                                Remove
                              </button>
                            </li>
                          )
                        )}
                    </ul>
                  </div>
                </>
              )}

              <button onClick={handleConfirm}>Confirm</button>
              <button className="close-btn" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        )}
        <div className="formButtons">
          <button className="back" onClick={handleBack}>
            Back
          </button>
          <button className="next" onClick={handleNext}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventSeries;
