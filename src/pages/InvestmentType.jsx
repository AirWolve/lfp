import React, { useState, useEffect } from "react";
import "./InvestmentType.css";
import { useNavigate } from "react-router-dom";
import { constPath } from "../config.js";
import { toast } from "react-toastify";
import trashIcon from "../assets/trash.svg";

const InvestmentType = () => {
  //For storing investment Types
  const [investmentTypes, setInvestmentTypes] = useState([]);

  //For showing modal
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  
  //For handling modal popup
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  //Format of investment type
  const investmentTypeForm = {
    name: "",
    description: "",
    returnAmtOrPct: "percent",
    returnDistribution: { type: "fixed", value: 0 },
    expenseRatio: null,
    incomeAmtOrPct: "percent",
    incomeDistribution: { type: "fixed", value: 0 },
    taxability: true,
  };

  //For storing value of type for each in modal popup that user input investment type data
  const [investmentType, setInvestmentType] = useState(investmentTypeForm);

  const handleConfirm = () => {
    if (
      !investmentType.name
    ) {
      toast.warning("Please Fill in all fields");
      return;
    }

    const updatedList = [...investmentTypes, investmentType];
    setInvestmentTypes(updatedList);

    //For storing investment type which is user input in local storage
    localStorage.setItem("InvestmentTypes", JSON.stringify(updatedList));

    setInvestmentTypes([...investmentTypes, investmentType]);
    setInvestmentType({ investmentTypeForm });
    closeModal();
  };

  const handleBack = (e) => {
    e.preventDefault();
    navigate(-1);
  };

  const handleNext = (e) => {
    e.preventDefault();
    navigate(`${constPath.investments}`);
  };

  //If user want to delete the list, user should click trash icon and it would be removed on front & in localstorage
  const handleDelete = (index) => {
    const updated = investmentTypes.filter((_, i) => i !== index);
    setInvestmentTypes(updated);
    localStorage.setItem("InvestmentTypes", JSON.stringify(updated));
  };

  // For maintain investment type information even though user return to this page from next page.
  useEffect(() => {
    const savedList = localStorage.getItem("InvestmentTypes");
    if(savedList) {
      setInvestmentTypes(JSON.parse(savedList));
    }

    const savedInvestmentType = localStorage.getItem("InvestmentType");
    if (savedInvestmentType) {
      setInvestmentType(JSON.parse(savedInvestmentType));
    }
  }, []);

  return (
    <div className="investmentPart">
      <h2>Investment Type</h2>

      <div className="investment-wrapper">
        <p style={{ textAlign: "center" }}>
          You can make list for your investment type in here.
        </p>
        <button className="add-btn" onClick={openModal}>
          add
        </button>

        {/* Modal popup part */}
        {/* To show the investment Types, I use map(to show each object that store data) */}
        {investmentTypes.map((inv, idx) => (
          <div key={idx} className="investment-item">
            <img
              src={trashIcon}
              alt="delete"
              className="trashIcon"
              onClick={() => handleDelete(idx)}
            />

            {/* For the list up on the front */}
            <ul style={{ fontSize: "15px" }}>
              <strong style={{ textAlign: "left" }}>{inv.name}</strong>:{" "}
              {inv.description}
              <li>Value: {inv.returnDistribution.value}</li>
              <li>Taxability: {inv.taxability ? "Taxable" : "Tax-exempt"}</li>
            </ul>

          </div>
        ))}
        
        {/* Prompt to ChatGPT: "How can I make the modal popup in this page?" */}
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>

            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h4>Add New Investment Type</h4>
              <label>Investment Type Name: </label>

              {/* type is text for input string. value is storing to investmentType.name */}
              <input
                type="text"
                value={investmentType.name}
                onChange={(e) =>
                  setInvestmentType({ ...investmentType, name: e.target.value })
                }
              />

              <label>Decription: </label>
              <input
                type="text"
                value={investmentType.description}
                onChange={(e) =>
                  setInvestmentType({
                    ...investmentType,
                    description: e.target.value,
                  })
                }
              />
              
              <label>Select notation type: </label>
              <select
                onChange={(e) =>
                  setInvestmentType({
                    ...investmentType,
                    returnAmtOrPct: e.target.value,
                  })
                }
              >
                {/* Choosing type percentage or amount */}
                <option value="percent">Percent</option>
                <option value="amount">Amount</option>
              </select>

              <input
                type="number"
                onChange={(e) =>
                  setInvestmentType({
                    ...investmentType,
                    returnDistribution: {
                      type: "fixed",
                      value: parseFloat(e.target.value),
                    },
                  })
                }
              />
              
              <label>Expense Ratio: </label>
              <input
                type="number"
                placeholder="Expense Ratio"
                value={investmentType.expenseRatio}
                onChange={(e) =>
                  setInvestmentType({
                    ...investmentType,
                    expenseRatio: parseFloat(e.target.value),
                  })
                }
              />
              
              <label>Select notation type: </label>
              <select
                onChange={(e) =>
                  setInvestmentType({
                    ...investmentType,
                    incomeAmtOrPct: e.target.value,
                  })
                }
              >
                <option value="percent">Percent</option>
                <option value="amount">Amount</option>
              </select>

              <input
                type="number"
                onChange={(e) =>
                  setInvestmentType({
                    ...investmentType,
                    incomeDistribution: {
                      type: "fixed",
                      value: parseFloat(e.target.value),
                    },
                  })
                }
              />

              <select
                onChange={(e) =>
                  setInvestmentType({
                    ...investmentType,
                    taxability: e.target.value === "true",
                  })
                }
              >
                <option value="true">Taxable</option>
                <option value="false">Tax-exempt</option>
              </select>

              <button onClick={handleConfirm}>Confirm</button>
              <button className="close-btn" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        )}
        <div className="formButton">
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

export default InvestmentType;
