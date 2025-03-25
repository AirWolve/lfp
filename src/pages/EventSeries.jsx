import React, { useState } from "react";
import "./EventSeries.css";
import { constPath } from "../config.js";
import { useNavigate } from "react-router-dom";
import trashIcon from "../assets/trash.svg";

const EventSeries = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleBack = (e) => {
    e.preventDefault();
    navigate(-1);
  }

  const handleNext = (e) => {
    e.preventDefault();
    navigate(`${constPath.overview}`);
  }

  const eventTypes = ["income", "expense", "invest", "rebalance"];

  // temporary invest type
  const assetAllocations = [
    "S&P 500 non-retirement",
    "S&P 500 after-tax",
    "tax-exempt bonds",
  ];

  // initial event status
  const initialEvent = {
    name: "",
    type: "income",
    startYear: 2025,
    duration: 1,
    amount: 0,
    assetAllocation: "",
    glidePath: false,
    assetAllocation2: "",
    maxCash: 0,
  };

  const [newEvent, setNewEvent] = useState(initialEvent);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  // add the list when click confirm
  const handleConfirm = () => {
    // max cash to 1000
    if (newEvent.maxCash > 1000) {
      alert("Cash cannot exceed 1000.");
      return;
    }
    setEvents([...events, newEvent]);
    setNewEvent(initialEvent);
    closeModal();
  };

  const handleDelete = (index) => {
    const updated = events.filter((_, i) => i !== index);
    setEvents(updated);
  }

  return (
    <div className="eventSeries-container">
        <div className="topbar">

        </div>
        <h2 style={{textAlign: "center", color: "white"}}>Event Series Setting</h2>
      <div className="eventseries-wrapper">
        <p style={{color: "#888888"}}>You can enter information about your income, expenses, investments, etc.</p>
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
                <div>Start Year: {event.startYear}</div>
                <div>Duration: {event.duration} year(s)</div>
                <div>Amount: ${event.amount}</div>
              </div>
            ) : event.type === "invest" ? (
              <div>
                <div>Start Year: {event.startYear}</div>
                <div>Duration: {event.duration} year(s)</div>
                <div>Asset Allocation: {event.assetAllocation}</div>
                <div>Glide Path: {event.glidePath ? "Yes" : "No"}</div>
                {event.glidePath && (
                  <div>Asset Allocation2: {event.assetAllocation2}</div>
                )}
                <div>Cash: ${event.maxCash}</div>
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
                {eventTypes.map((type, idx) => (
                  <option key={idx} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              {/* income or expense -> Start Year, Duration, Amount */}
              {(newEvent.type === "income" || newEvent.type === "expense") && (
                <>
                <label>start Year</label>
                  <input
                    type="number"
                    placeholder="Start Year"
                    value={newEvent.startYear}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        startYear: parseInt(e.target.value, 10),
                      })
                    }
                  />
                  <label>Duration for years</label>
                  <input
                    type="number"
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
                    placeholder="Amount"
                    value={newEvent.amount}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        amount: parseFloat(e.target.value),
                      })
                    }
                  />
                </>
              )}

              {/* invest -> Start Year, Duration, assetAllocation, glidePath, assetAllocation2, maxCash */}
              {newEvent.type === "invest" && (
                <>
                  <input
                    type="number"
                    placeholder="Start Year"
                    value={newEvent.startYear}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        startYear: parseInt(e.target.value, 10),
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

                  <label>Asset Allocation</label>
                  <select
                    value={newEvent.assetAllocation}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        assetAllocation: e.target.value,
                      })
                    }
                  >
                    <option value="">-- Select --</option>
                    {assetAllocations.map((alloc, idx) => (
                      <option key={idx} value={alloc}>
                        {alloc}
                      </option>
                    ))}
                  </select>

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

                  {newEvent.glidePath && (
                    <>
                      <label>Asset Allocation2</label>
                      <select
                        value={newEvent.assetAllocation2}
                        onChange={(e) =>
                          setNewEvent({
                            ...newEvent,
                            assetAllocation2: e.target.value,
                          })
                        }
                      >
                        <option value="">-- Select --</option>
                        {assetAllocations.map((alloc, idx) => (
                          <option key={idx} value={alloc}>
                            {alloc}
                          </option>
                        ))}
                      </select>
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

              {/* rebalance */}

              <button onClick={handleConfirm}>Confirm</button>
              <button className="close-btn" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        )}
        <div className="form-buttons">
              <button className="back" onClick={handleBack}>Back</button>
              <button className="next" onClick={handleNext}>Next</button>
            </div>
      </div>
    </div>
  );
};

export default EventSeries;
