import React, { useState } from "react";
import { constPath } from "../config.js";
import "./Investments.css";
import { useNavigate } from "react-router-dom";

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
    navigate();
  }
  const [newInvestment, setNewInvestment] = useState({
    type: "",
    amount: 0,
    taxStatus: "non-retirement",
  });

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleConfirm = () => {
    setInvestments([...investments, newInvestment]);
    setNewInvestment({ type: "", amount: 0, taxStatus: "non-retirement" });
    closeModal();
  };

  //Js import after connecting back-end
  // const investmentTypes = JSON.parse(localStorage.getItem("investmentTypes")) || [];

  // temporary investment type provide
  const investmentTypes = ["Stocks", "Bonds", "Cryptocurrency"];

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

        {investments.map((inv, idx) => (
          <div key={idx} className="investment-item">
            <strong>{inv.type}</strong>: ${inv.amount}
            <ul>
              <li>Tax: {inv.taxStatus}</li>
            </ul>
          </div>
        ))}

        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h4>Add Investment</h4>

              <select
                value={newInvestment.type}
                onChange={(e) =>
                  setNewInvestment({ ...newInvestment, type: e.target.value })
                }
              >
                <option value="">-- Select Investment Type --</option>
                {investmentTypes.map((type, idx) => (
                  <option key={idx} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Investment Amount"
                value={newInvestment.amount}
                onChange={(e) =>
                  setNewInvestment({
                    ...newInvestment,
                    amount: parseFloat(e.target.value),
                  })
                }
              />

              <select
                value={newInvestment.taxStatus}
                onChange={(e) =>
                  setNewInvestment({
                    ...newInvestment,
                    taxStatus: e.target.value,
                  })
                }
              >
                <option value="non-retirement">Non-retirement</option>
                <option value="pre-tax">Pre-tax</option>
                <option value="after-tax">After-tax</option>
              </select>

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

export default Investments;
