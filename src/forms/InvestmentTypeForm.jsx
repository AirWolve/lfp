import React from "react";
import formStyles from "../css/InvestmentTypeForm.module.css";

/* 
    Investment type form
    Use the handleConfirm to confirm the investment type
    Use the closeModal to close the modal
*/

const InvestmentTypeForm = ({
  investmentType,
  setInvestmentType,
  handleConfirm,
  closeModal,
}) => {
  // Update returnDistribution state by type
  const updateReturnDistribution = (type, updates = {}) => {
    const newDist = { type };
    Object.entries(updates).forEach(([k, v]) => { if (v !== null) newDist[k] = v; });
    setInvestmentType({ ...investmentType, returnDistribution: newDist });
  };
  // Update incomeDistribution state by type
  const updateIncomeDistribution = (type, updates = {}) => {
    const newDist = { type };
    Object.entries(updates).forEach(([k, v]) => { if (v !== null) newDist[k] = v; });
    setInvestmentType({ ...investmentType, incomeDistribution: newDist });
  };

  return (
    <div className={formStyles.formContainer}>
      <div className={formStyles.formSection}>
        <div className={formStyles.sectionTitle}>Basic Information</div>
        <div className={formStyles.formGroup}>
          <label>Investment Type Name</label>
          <input
            type="text"
            placeholder="Enter investment type name"
            value={investmentType.name}
            onChange={e => setInvestmentType({ ...investmentType, name: e.target.value })}
            className={formStyles.formInput}
          />
        </div>
        <div className={formStyles.formGroup}>
          <label>Description</label>
          <input
            type="text"
            placeholder="Enter description"
            value={investmentType.description}
            onChange={e => setInvestmentType({ ...investmentType, description: e.target.value })}
            className={formStyles.formInput}
          />
        </div>
      </div>

      {/* Return Distribution */}
      <div className={formStyles.formSection}>
        <div className={formStyles.sectionTitle}>Return Distribution</div>
        <div className={formStyles.formRow}>
          <div className={formStyles.formGroup}>
            <label>Notation Type</label>
            <select
              value={investmentType.returnAmtOrPct}
              onChange={e => setInvestmentType({ ...investmentType, returnAmtOrPct: e.target.value })}
              className={formStyles.formSelect}
            >
              <option value="percent">Percent</option>
              <option value="amount">Amount</option>
            </select>
          </div>
          <div className={formStyles.formGroup}>
            <label>Distribution Type</label>
            <select
              value={investmentType.returnDistribution.type}
              onChange={e => updateReturnDistribution(e.target.value)}
              className={formStyles.formSelect}
            >
              <option value="fixed">Fixed</option>
              <option value="normal">Normal</option>
              <option value="uniform">Uniform</option>
            </select>
          </div>
        </div>
        {/* Distribution type specific fields */}
        {investmentType.returnDistribution.type === "fixed" && (
          <div className={formStyles.formGroup}>
            <label>Fixed Value</label>
            <input
              type="number"
              placeholder="Enter fixed value"
              value={investmentType.returnDistribution.value ?? ""}
              onChange={e => updateReturnDistribution("fixed", { value: parseFloat(e.target.value) })}
              className={formStyles.formInput}
            />
          </div>
        )}
        {investmentType.returnDistribution.type === "normal" && (
          <div className={formStyles.formRow}>
            <div className={formStyles.formGroup}>
              <label>Mean</label>
              <input
                type="number"
                placeholder="Enter mean value"
                value={investmentType.returnDistribution.mean ?? ""}
                onChange={e => updateReturnDistribution("normal", { mean: parseFloat(e.target.value), stdev: investmentType.returnDistribution.stdev })}
                className={formStyles.formInput}
              />
            </div>
            <div className={formStyles.formGroup}>
              <label>Standard Deviation</label>
              <input
                type="number"
                placeholder="Enter standard deviation"
                value={investmentType.returnDistribution.stdev ?? ""}
                onChange={e => updateReturnDistribution("normal", { mean: investmentType.returnDistribution.mean, stdev: parseFloat(e.target.value) })}
                className={formStyles.formInput}
              />
            </div>
          </div>
        )}
        {investmentType.returnDistribution.type === "uniform" && (
          <div className={formStyles.formRow}>
            <div className={formStyles.formGroup}>
              <label>Lower Bound</label>
              <input
                type="number"
                placeholder="Enter lower bound"
                value={investmentType.returnDistribution.lower ?? ""}
                onChange={e => updateReturnDistribution("uniform", { lower: parseFloat(e.target.value), upper: investmentType.returnDistribution.upper })}
                className={formStyles.formInput}
              />
            </div>
            <div className={formStyles.formGroup}>
              <label>Upper Bound</label>
              <input
                type="number"
                placeholder="Enter upper bound"
                value={investmentType.returnDistribution.upper ?? ""}
                onChange={e => updateReturnDistribution("uniform", { lower: investmentType.returnDistribution.lower, upper: parseFloat(e.target.value) })}
                className={formStyles.formInput}
              />
            </div>
          </div>
        )}
      </div>

      {/* Expense Ratio */}
      <div className={formStyles.formSection}>
        <div className={formStyles.formGroup}>
          <label>Expense Ratio</label>
          <input
            type="number"
            placeholder="Enter expense ratio"
            value={investmentType.expenseRatio ?? ""}
            onChange={e => setInvestmentType({ ...investmentType, expenseRatio: parseFloat(e.target.value) })}
            className={formStyles.formInput}
          />
        </div>
      </div>

      {/* Income Distribution */}
      <div className={formStyles.formSection}>
        <div className={formStyles.sectionTitle}>Income Distribution</div>
        <div className={formStyles.formRow}>
          <div className={formStyles.formGroup}>
            <label>Notation Type</label>
            <select
              value={investmentType.incomeAmtOrPct}
              onChange={e => setInvestmentType({ ...investmentType, incomeAmtOrPct: e.target.value })}
              className={formStyles.formSelect}
            >
              <option value="percent">Percent</option>
              <option value="amount">Amount</option>
            </select>
          </div>
          <div className={formStyles.formGroup}>
            <label>Distribution Type</label>
            <select
              value={investmentType.incomeDistribution.type}
              onChange={e => updateIncomeDistribution(e.target.value)}
              className={formStyles.formSelect}
            >
              <option value="fixed">Fixed</option>
              <option value="normal">Normal</option>
              <option value="uniform">Uniform</option>
            </select>
          </div>
        </div>
        {/* Distribution type specific fields */}
        {investmentType.incomeDistribution.type === "fixed" && (
          <div className={formStyles.formGroup}>
            <label>Fixed Value</label>
            <input
              type="number"
              placeholder="Enter fixed value"
              value={investmentType.incomeDistribution.value ?? ""}
              onChange={e => updateIncomeDistribution("fixed", { value: parseFloat(e.target.value) })}
              className={formStyles.formInput}
            />
          </div>
        )}
        {investmentType.incomeDistribution.type === "normal" && (
          <div className={formStyles.formRow}>
            <div className={formStyles.formGroup}>
              <label>Mean</label>
              <input
                type="number"
                placeholder="Enter mean value"
                value={investmentType.incomeDistribution.mean ?? ""}
                onChange={e => updateIncomeDistribution("normal", { mean: parseFloat(e.target.value), stdev: investmentType.incomeDistribution.stdev })}
                className={formStyles.formInput}
              />
            </div>
            <div className={formStyles.formGroup}>
              <label>Standard Deviation</label>
              <input
                type="number"
                placeholder="Enter standard deviation"
                value={investmentType.incomeDistribution.stdev ?? ""}
                onChange={e => updateIncomeDistribution("normal", { mean: investmentType.incomeDistribution.mean, stdev: parseFloat(e.target.value) })}
                className={formStyles.formInput}
              />
            </div>
          </div>
        )}
        {investmentType.incomeDistribution.type === "uniform" && (
          <div className={formStyles.formRow}>
            <div className={formStyles.formGroup}>
              <label>Lower Bound</label>
              <input
                type="number"
                placeholder="Enter lower bound"
                value={investmentType.incomeDistribution.lower ?? ""}
                onChange={e => updateIncomeDistribution("uniform", { lower: parseFloat(e.target.value), upper: investmentType.incomeDistribution.upper })}
                className={formStyles.formInput}
              />
            </div>
            <div className={formStyles.formGroup}>
              <label>Upper Bound</label>
              <input
                type="number"
                placeholder="Enter upper bound"
                value={investmentType.incomeDistribution.upper ?? ""}
                onChange={e => updateIncomeDistribution("uniform", { lower: investmentType.incomeDistribution.lower, upper: parseFloat(e.target.value) })}
                className={formStyles.formInput}
              />
            </div>
          </div>
        )}
      </div>

      {/* Taxability */}
      <div className={formStyles.formSection}>
        <div className={formStyles.formGroup}>
          <label>Taxability</label>
          <select
            value={investmentType.taxability ? "true" : "false"}
            onChange={e => setInvestmentType({ ...investmentType, taxability: e.target.value === "true" })}
            className={formStyles.formSelect}
          >
            <option value="true">Taxable</option>
            <option value="false">Tax-exempt</option>
          </select>
        </div>
      </div>

      <button
        className={`${formStyles.formFullButton} ${formStyles.formConfirmButton}`}
        onClick={handleConfirm}
        type="button"
      >
        Confirm
      </button>
      <button
        className={`${formStyles.formFullButton} ${formStyles.formCloseButton} close-btn`}
        onClick={closeModal}
        type="button"
      >
        Close
      </button>
    </div>
  );
};

export default InvestmentTypeForm; 