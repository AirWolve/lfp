import React, { useState, useEffect } from "react";
import "../css/EventSeries.css";
import { constPath } from "../config.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import trashIcon from "../assets/trash.svg";
import IncomeEventForm, { initialIncomeEvent } from "../forms/IncomeEventForm";
import ExpenseEventForm, { initialExpenseEvent } from "../forms/ExpenseEventForm";
import InvestEventForm, { initialInvestEvent } from "../forms/InvestEventForm";
import RebalanceEventForm, { initialRebalanceEvent } from "../forms/RebalanceEventForm";

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
    const basicInfo = JSON.parse(localStorage.getItem("basicInfo") || "{}");
    const investmentTypes = JSON.parse(localStorage.getItem("InvestmentTypes") || "{}");
    const investments = JSON.parse(localStorage.getItem("Investments") || "{}");
    const eventSeries = JSON.parse(localStorage.getItem("EventSeries") || "[]");

    if (!basicInfo.name) {
      toast.error("Scenario name is required in Basic Settings");
      return;
    }

    const combinedData = {
      ...basicInfo,
      investmentTypes,
      investments,
      eventSeries
    };

    localStorage.setItem("BasicSettings", JSON.stringify(combinedData));
    navigate(`${constPath.overview}`);
  };

  const eventTypes = ["income", "expense", "invest", "rebalance"];

  // storing data for allocation1
  const [selectInvestment, setSelectInvestment] = useState();
  const [allocationNum, setAllocationNum] = useState();

  //storing data for allocation2
  const [selectInvestment2, setSelectInvestment2] = useState();
  const [allocationNum2, setAllocationNum2] = useState();

  const investmentsData = JSON.parse(
    localStorage.getItem("Investments") || "[]"
  );

  const assetAllocations = investmentsData.map((investment) => investment.id);
  const incomeEvents = events.filter((event) => event.type === "income");

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const getInitialEventByType = (type) => {
    switch (type) {
      case "income":
        return { ...initialIncomeEvent };
      case "expense":
        return { ...initialExpenseEvent };
      case "invest":
        return { ...initialInvestEvent };
      case "rebalance":
        return { ...initialRebalanceEvent };
      default:
        return { name: "", type: "" };
    }
  };

  const [newEvent, setNewEvent] = useState({ name: "", type: "" });

  const handleEventTypeChange = (type) => {
    setNewEvent(getInitialEventByType(type));
  };

  const handleConfirm = () => {
    if (!newEvent.name) {
      toast.warning("Please Fill in all fields");
      return;
    }

    if (newEvent.maxCash > 1000) {
      toast.warning("Cash cannot exceed 1000.");
      return;
    }

    const updatedList = [...events, newEvent];
    setEvents(updatedList);
    localStorage.setItem("EventSeries", JSON.stringify(updatedList));
    setEvents([...events, newEvent]);
    setNewEvent({ name: "", type: "" });
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

  return (
    <div className="eventSeries-container">
      <h2 style={{ textAlign: "center", color: "white" }}>
        Event Series Setting
      </h2>
      <div className="eventseries-wrapper">
        <p style={{ color: "#888888" }}>
          You can enter information about your income, expenses, investments,
          etc.
        </p>
        <p style={{ fontSize: "13px", color: "red" }}>
          Please enter your income information first.
        </p>
        <button className="add-btn" onClick={openModal}>
          add event
        </button>

        {events.map((event, idx) => (
          <div key={idx} className="event-item">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <strong>{event.name}</strong>
              </div>
              <img
                src={trashIcon}
                alt="delete"
                className="trash-icon"
                onClick={() => handleDelete(idx)}
              />
            </div>
            {event.type && (
              <div>
                <div>Type: {event.type} </div>
              </div>
            )}
          </div>
        ))}

        {showModal && (
          <div className="modal-overlay" onMouseDown={closeModal}>
            <div className="modal-content" onMouseDown={(e) => e.stopPropagation()}>
              <h4>Add Event Series</h4>

              <label>Event Name</label>
              <input
                type="text"
                value={newEvent.name}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, name: e.target.value })
                }
              />

              <label>What is the type of?</label>
              <select
                value={newEvent.type}
                onChange={(e) => handleEventTypeChange(e.target.value)}
              >
                <option value="">-- Select Type --</option>
                {eventTypes.map((type, idx) => (
                  <option key={idx} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              {newEvent.type === "income" && (
                <IncomeEventForm
                  newEvent={newEvent}
                  setNewEvent={setNewEvent}
                />
              )}

              {newEvent.type === "expense" && (
                <ExpenseEventForm
                  newEvent={newEvent}
                  setNewEvent={setNewEvent}
                  incomeEvents={incomeEvents}
                />
              )}

              {newEvent.type === "invest" && (
                <InvestEventForm
                  newEvent={newEvent}
                  setNewEvent={setNewEvent}
                  assetAllocations={assetAllocations}
                  selectInvestment={selectInvestment}
                  setSelectInvestment={setSelectInvestment}
                  allocationNum={allocationNum}
                  setAllocationNum={setAllocationNum}
                  selectInvestment2={selectInvestment2}
                  setSelectInvestment2={setSelectInvestment2}
                  allocationNum2={allocationNum2}
                  setAllocationNum2={setAllocationNum2}
                />
              )}

              {newEvent.type === "rebalance" && (
                <RebalanceEventForm
                  newEvent={newEvent}
                  setNewEvent={setNewEvent}
                  assetAllocations={assetAllocations}
                  selectInvestment={selectInvestment}
                  setSelectInvestment={setSelectInvestment}
                  allocationNum={allocationNum}
                  setAllocationNum={setAllocationNum}
                />
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
