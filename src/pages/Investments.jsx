import React, { useState, useEffect } from "react";
import "../css/Investments.css";
import { useNavigate } from "react-router-dom";
import { constPath } from "../config.js";
import { toast } from "react-toastify";
import trashIcon from "../assets/trash.svg";
import InvestmentForm from "../forms/InvestmentForm";

const Investments = () => {
  const [investments, setInvestments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleBack = (e) => {
    e.preventDefault();
    navigate(-1);
  }

  const handleNext = (e) => {
    e.preventDefault();
    navigate(`${constPath.eventSeries}`);
  }

  const handleDelete = (index) => {
    const updated = investments.filter((_, i) => i !== index);
    setInvestments(updated);
    localStorage.setItem("Investments", JSON.stringify(updated));
  };

  const investmentsForm = {
    investmentType: "",
    value: null,
    taxStatus: "non-retirement",
    id: ""
  };

  const [newInvestment, setNewInvestment] = useState(investmentsForm);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleConfirm = () => {
    if (
      !newInvestment.investmentType ||
      !newInvestment.value
    ) {
      toast.warning("Please Fill in all fields");
      return;
    }

    newInvestment.id = newInvestment.investmentType + " " + newInvestment.taxStatus;
    const updatedList = [...investments, newInvestment];
    setInvestments(updatedList);

    localStorage.setItem("Investments", JSON.stringify(updatedList));

    setNewInvestment({ ...investmentsForm });
    closeModal();
  };

    // For maintain investment type information even though user return to this page from next page.
    useEffect(() => {
      const savedList = localStorage.getItem("Investments");
      if(savedList) {
        setInvestments(JSON.parse(savedList));
      }
  
      const savedInvestments = localStorage.getItem("Investments");
      if (savedInvestments) {
        setInvestments(JSON.parse(savedInvestments));
      }
    }, []);

  //load investment type as stored in local storage
  const investmentTypes = JSON.parse(localStorage.getItem("InvestmentTypes")) || [];

  return (
    <div>
        <div className="topbar">

        </div>
      <h2 style={{ color: "white", textAlign: "center" }}>Investments</h2>
      <div className="investment-wrapper">
        <h2 style={{ fontSize: "14px", fontWeight: "500" }}>
          You can write down what investments you made based on the Investment
          Type you saved.
        </h2>
        <button className="add-btn" onClick={openModal}>
          add
        </button>

        <div className="events-list">
          {investments.map((inv, idx) => (
            <div key={idx} className="event-item">
              <div className="event-summary">
                <div className="event-header">
                  <span className="event-badge invest">Investment</span>
                  <strong>{inv.investmentType}</strong>
                </div>
                <div className="event-tags-main">
                  <span className="event-tag">Amount: ${inv.value}</span>
                  <span className="event-tag">Tax: {inv.taxStatus}</span>
                </div>
              </div>
              <button 
                className="delete-btn" 
                onClick={() => handleDelete(idx)}
                title="Delete investment"
              >
                <img src={trashIcon} alt="delete" className="trash-icon" />
              </button>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="modal-overlay" onMouseDown={closeModal}>
            <div className="modal-content" onMouseDown={(e) => e.stopPropagation()}>
              <InvestmentForm
                newInvestment={newInvestment}
                setNewInvestment={setNewInvestment}
                investmentTypes={investmentTypes}
                handleConfirm={handleConfirm}
                closeModal={closeModal}
              />
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

export default Investments;
