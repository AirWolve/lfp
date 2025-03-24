import React, { useState } from "react";
import "./InvestmentType.css";
import { useNavigate } from "react-router-dom";

const InvestmentType = () => {
  const [investments, setInvestments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const [newInvestment, setNewInvestment] = useState({
    name: "",
    description: "",
    returnAmtOrPct: "percent",
    returnDistribution: { type: "fixed", value: 0 },
    expenseRatio: 0,
    incomeAmtOrPct: "percent",
    incomeDistribution: { type: "fixed", value: 0 },
    taxability: true,
  });

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleConfirm = () => {
    setInvestments([...investments, newInvestment]);
    setNewInvestment({
      name: "",
      description: "",
      returnAmtOrPct: "percent",
      returnDistribution: { type: "fixed", value: 0 },
      expenseRatio: 0,
      incomeAmtOrPct: "percent",
      incomeDistribution: { type: "fixed", value: 0 },
      taxability: true,
    });
    closeModal();
  };

  const handleBack = (e) => {
    e.preventDefault();
    navigate(-1);
  }

  const handleNext = (e) => {
    e.preventDefault();
    navigate();
  }

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

        {investments.map((inv, idx) => (
          <div key={idx} className="investment-item">
            <strong>{inv.name}</strong>: {inv.description}
            <ul style={{ fontSize: "15px" }}>
              <li>Value: {inv.returnDistribution.value}</li>
              <li>Expense Ratio: {inv.expenseRatio}</li>
              <li>Value: {inv.incomeDistribution.value}</li>
              <li>Taxability: {inv.taxability ? "Taxable" : "Tax-exempt"}</li>
            </ul>
          </div>
        ))}

        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h4>Add New Investment Type</h4>
              <label>Investment Type Name: </label>
              <input
                type="text"
                value={newInvestment.name}
                onChange={(e) =>
                  setNewInvestment({ ...newInvestment, name: e.target.value })
                }
              />

              <label>Decription: </label>
              <input
                type="text"
                value={newInvestment.description}
                onChange={(e) =>
                  setNewInvestment({
                    ...newInvestment,
                    description: e.target.value,
                  })
                }
              />
              <label>Select notation type: </label>
              <select
                onChange={(e) =>
                  setNewInvestment({
                    ...newInvestment,
                    returnAmtOrPct: e.target.value,
                  })
                }
              >
                <option value="percent">Percent</option>
                <option value="amount">Amount</option>
              </select>

              <input
                type="number"
                onChange={(e) =>
                  setNewInvestment({
                    ...newInvestment,
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
                value={newInvestment.expenseRatio}
                onChange={(e) =>
                  setNewInvestment({
                    ...newInvestment,
                    expenseRatio: parseFloat(e.target.value),
                  })
                }
              />
              <label>Select notation type: </label>
              <select
                onChange={(e) =>
                  setNewInvestment({
                    ...newInvestment,
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
                  setNewInvestment({
                    ...newInvestment,
                    incomeDistribution: {
                      type: "fixed",
                      value: parseFloat(e.target.value),
                    },
                  })
                }
              />

              <select
                onChange={(e) =>
                  setNewInvestment({
                    ...newInvestment,
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
        <div className="form-buttons">
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
