import React, { useState, useEffect } from "react";
import "../css/InvestmentType.css";
import { useNavigate } from "react-router-dom";
import { constPath } from "../config.js";
import { toast } from "react-toastify";
import trashIcon from "../assets/trash.svg";
import InvestmentTypeForm from "../forms/InvestmentTypeForm";

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
    returnDistribution: { type: "fixed", value: null },
    expenseRatio: null,
    incomeAmtOrPct: "percent",
    incomeDistribution: { type: "fixed", value: null },
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
    setInvestmentType(investmentTypeForm);
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

        {/* Refactor card-type list */}
        <div className="events-list">
          {investmentTypes.map((inv, idx) => (
            <div key={idx} className="event-item">
              <div className="event-summary">
                <div className="event-header">
                  <span className="event-badge rebalance">Types</span>
                  <strong>{inv.name}</strong>
                </div>
                <div className="event-tags-main">
                  {inv.description && (
                    <span className="event-tag">{inv.description}</span>
                  )}
                  {inv.returnDistribution && inv.returnDistribution.type && (
                    <span className="event-tag">
                      Return: {inv.returnDistribution.type === 'fixed' ? inv.returnDistribution.value : inv.returnDistribution.type === 'normal' ? `N(${inv.returnDistribution.mean ?? '-'}, ${inv.returnDistribution.stdev ?? '-'})` : inv.returnDistribution.type === 'uniform' ? `U(${inv.returnDistribution.lower ?? '-'}, ${inv.returnDistribution.upper ?? '-'})` : ''}
                    </span>
                  )}
                  {inv.incomeDistribution && inv.incomeDistribution.type && (
                    <span className="event-tag">
                      Income: {inv.incomeDistribution.type === 'fixed' ? inv.incomeDistribution.value : inv.incomeDistribution.type === 'normal' ? `N(${inv.incomeDistribution.mean ?? '-'}, ${inv.incomeDistribution.stdev ?? '-'})` : inv.incomeDistribution.type === 'uniform' ? `U(${inv.incomeDistribution.lower ?? '-'}, ${inv.incomeDistribution.upper ?? '-'})` : ''}
                    </span>
                  )}
                  {inv.expenseRatio !== null && (
                    <span className="event-tag">Expense Ratio: {inv.expenseRatio}</span>
                  )}
                  <span className="event-tag">Taxability: {inv.taxability ? "Taxable" : "Tax-exempt"}</span>
                </div>
              </div>
              <button 
                className="delete-btn" 
                onClick={() => handleDelete(idx)}
                title="Delete investment type"
              >
                <img src={trashIcon} alt="delete" className="trash-icon" />
              </button>
            </div>
          ))}
        </div>
        
        {/* Prompt to ChatGPT: "How can I make the modal popup in this page?" */}
        {showModal && (
          <div className="modal-overlay" onMouseDown={closeModal}>
            <div className="modal-content" onMouseDown={(e) => e.stopPropagation()}>
              <InvestmentTypeForm
                investmentType={investmentType}
                setInvestmentType={setInvestmentType}
                handleConfirm={handleConfirm}
                closeModal={closeModal}
              />
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
