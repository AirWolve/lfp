import React from "react";

const InvestmentForm = ({
  newInvestment,
  setNewInvestment,
  investmentTypes,
  handleConfirm,
  closeModal,
}) => {
  return (
    <>
      <h4>Add Investment</h4>
      <select
        value={newInvestment.investmentType}
        onChange={(e) =>
          setNewInvestment({ ...newInvestment, investmentType: e.target.value })
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
        value={newInvestment.value}
        onChange={(e) =>
          setNewInvestment({
            ...newInvestment,
            value: parseFloat(e.target.value),
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
    </>
  );
};

export default InvestmentForm; 