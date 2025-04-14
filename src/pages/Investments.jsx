import React, { useState, useEffect } from "react";
import "./Investments.css";
import { useNavigate } from "react-router-dom";
import { constPath } from "../config.js";
import { toast } from "react-toastify";

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

  const investmentsForm = {
    type: "",
    amount: null,
    taxStatus: "non-retirement",
    id: ""
  };

  const [newInvestment, setNewInvestment] = useState(investmentsForm);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleConfirm = () => {
    if (
      !newInvestment.type ||
      !newInvestment.amount
    ) {
      toast.warning("Please Fill in all fields");
      return;
    }

    newInvestment.id = newInvestment.type === "S&P 500" ? newInvestment.type + " " + newInvestment.taxStatus : newInvestment.type;
    const updatedList = [...investments, newInvestment];
    setInvestments(updatedList);

    localStorage.setItem("Investments", JSON.stringify(updatedList));

    setInvestments([...investments, newInvestment]);
    setNewInvestment({ investmentsForm });
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
                {investmentTypes.map((typeObj, idx) => (
                  <option key={idx} value={typeObj.name}>
                    {typeObj.name}
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
