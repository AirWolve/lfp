import React from "react";
import formStyles from "../css/FormStyles.module.css";

export const initialIncomeEvent = {
  name: "",
  type: "income",
  start: {
    type: "fixed",
    value: null,
  },
  duration: {
    type: "fixed",
    value: null,
  },
  initialAmount: null,
  changeAmtOrPct: "",
  changeDistribution: {
    type: "fixed",
    value: null
  },
  inflationAdjusted: false,
  userFraction: null,
  socialSecurity: false,
};

const IncomeEventForm = ({ newEvent, setNewEvent }) => {
  const updateChangeDistribution = (type, updates = {}) => {
    const newDistribution = { type };
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== null) {
        newDistribution[key] = value;
      }
    });

    setNewEvent({
      ...newEvent,
      changeDistribution: newDistribution,
    });
  };

  return (
    <div className={formStyles.formContainer}>
      {/* Basic Info Section */}
      <div className={formStyles.formSection}>
        <div className={formStyles.sectionTitle}>Basic Information</div>
        <div className={formStyles.formGroup}>
          <label>Name</label>
          <input
            type="text"
            placeholder="Enter event name"
            value={newEvent.name}
            onChange={e => setNewEvent({ ...newEvent, name: e.target.value })}
            className={formStyles.formInput}
          />
        </div>
        <div className={formStyles.formGroup}>
          <label>Start Year</label>
          <input
            type="number"
            placeholder="Enter start year"
            value={newEvent.start.value ?? ""}
            onChange={e => setNewEvent({
              ...newEvent,
              start: { ...newEvent.start, value: e.target.value === "" ? null : parseInt(e.target.value, 10) }
            })}
            className={formStyles.formInput}
          />
        </div>
        <div className={formStyles.formGroup}>
          <label>Duration (years)</label>
          <input
            type="number"
            placeholder="Enter duration in years"
            value={newEvent.duration.value ?? ""}
            onChange={e => setNewEvent({
              ...newEvent,
              duration: { ...newEvent.duration, value: e.target.value === "" ? null : parseInt(e.target.value, 10) }
            })}
            className={formStyles.formInput}
          />
        </div>
      </div>

      {/* Amount Details Section */}
      <div className={formStyles.formSection}>
        <div className={formStyles.sectionTitle}>Amount Details</div>
        <div className={formStyles.formGroup}>
          <label>Amount</label>
          <input
            type="number"
            placeholder="Enter amount"
            value={newEvent.initialAmount ?? ""}
            onChange={e => setNewEvent({
              ...newEvent,
              initialAmount: e.target.value === "" ? null : parseFloat(e.target.value)
            })}
            className={formStyles.formInput}
          />
        </div>
        {/* Change Type and Distribution Type in one row */}
        <div className={formStyles.formRow}>
          <div className={`${formStyles.formGroup} ${formStyles.flex1}`}>
            <label>Change Type</label>
            <select
              value={newEvent.changeAmtOrPct}
              onChange={e => {
                const selectedValue = e.target.value;
                setNewEvent(prev => ({
                  ...prev,
                  changeAmtOrPct: selectedValue,
                  changeDistribution: { type: "fixed", value: null },
                }));
              }}
              className={formStyles.formSelect}
            >
              <option value="">-- Select Change Type --</option>
              <option value="amount">Amount</option>
              <option value="percent">Percent</option>
            </select>
          </div>
          <div className={`${formStyles.formGroup} ${formStyles.flex1}`}>
            <label>Distribution Type</label>
            <select
              value={newEvent.changeDistribution.type}
              onChange={e => {
                const selectedType = e.target.value;
                updateChangeDistribution(selectedType);
              }}
              className={formStyles.formSelect}
            >
              <option value="fixed">Fixed</option>
              <option value="normal">Normal</option>
              <option value="uniform">Uniform</option>
            </select>
          </div>
        </div>
        {/* Distribution type specific fields */}
        {newEvent.changeDistribution.type === "fixed" && (
          <div className={formStyles.formGroup}>
            <label>Fixed Value</label>
            <input
              type="number"
              placeholder="Enter fixed value"
              value={newEvent.changeDistribution.value ?? ""}
              onChange={e =>
                updateChangeDistribution("fixed", {
                  value: e.target.value === "" ? null : parseFloat(e.target.value),
                })
              }
              className={formStyles.formInput}
              style={{ WebkitAppearance: "none", MozAppearance: "textfield" }}
            />
          </div>
        )}
        {newEvent.changeDistribution.type === "normal" && (
          <div className={formStyles.formRow}>
            <div className={`${formStyles.formGroup} ${formStyles.flex1}`}>
              <label>Mean</label>
              <input
                type="number"
                placeholder="Enter mean value"
                value={newEvent.changeDistribution.mean ?? ""}
                onChange={e =>
                  updateChangeDistribution("normal", {
                    mean: e.target.value === "" ? null : parseFloat(e.target.value),
                    stdev: newEvent.changeDistribution.stdev,
                  })
                }
                className={formStyles.formInput}
                style={{ WebkitAppearance: "none", MozAppearance: "textfield" }}
              />
            </div>
            <div className={`${formStyles.formGroup} ${formStyles.flex1}`}>
              <label>Standard Deviation</label>
              <input
                type="number"
                placeholder="Enter standard deviation"
                value={newEvent.changeDistribution.stdev ?? ""}
                onChange={e =>
                  updateChangeDistribution("normal", {
                    mean: newEvent.changeDistribution.mean,
                    stdev: e.target.value === "" ? null : parseFloat(e.target.value),
                  })
                }
                className={formStyles.formInput}
                style={{ WebkitAppearance: "none", MozAppearance: "textfield" }}
              />
            </div>
          </div>
        )}
        {newEvent.changeDistribution.type === "uniform" && (
          <div className={formStyles.formRow}>
            <div className={`${formStyles.formGroup} ${formStyles.flex1}`}>
              <label>Lower Bound</label>
              <input
                type="number"
                placeholder="Enter lower bound"
                value={newEvent.changeDistribution.lower ?? ""}
                onChange={e =>
                  updateChangeDistribution("uniform", {
                    lower: e.target.value === "" ? null : parseFloat(e.target.value),
                    upper: newEvent.changeDistribution.upper,
                  })
                }
                className={formStyles.formInput}
                style={{ WebkitAppearance: "none", MozAppearance: "textfield" }}
              />
            </div>
            <div className={`${formStyles.formGroup} ${formStyles.flex1}`}>
              <label>Upper Bound</label>
              <input
                type="number"
                placeholder="Enter upper bound"
                value={newEvent.changeDistribution.upper ?? ""}
                onChange={e =>
                  updateChangeDistribution("uniform", {
                    lower: newEvent.changeDistribution.lower,
                    upper: e.target.value === "" ? null : parseFloat(e.target.value),
                  })
                }
                className={formStyles.formInput}
                style={{ WebkitAppearance: "none", MozAppearance: "textfield" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Additional Options Section */}
      <div className={formStyles.formSection}>
        <div className={formStyles.sectionTitle}>Additional Options</div>
        <div className={`${formStyles.formRow} ${formStyles.optionsRow}`}>
          <div className={formStyles.toggleGroup}>
            <label className={formStyles.toggleLabel}>
              <span>Inflation Adjusted</span>
              <div className={formStyles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={newEvent.inflationAdjusted}
                  onChange={e =>
                    setNewEvent({
                      ...newEvent,
                      inflationAdjusted: e.target.checked,
                    })
                  }
                />
                <span className={formStyles.toggleSlider}></span>
              </div>
            </label>
          </div>
          <div className={formStyles.toggleGroup}>
            <label className={formStyles.toggleLabel}>
              <span>Social Security</span>
              <div className={formStyles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={newEvent.socialSecurity}
                  onChange={e =>
                    setNewEvent({
                      ...newEvent,
                      socialSecurity: e.target.checked,
                    })
                  }
                />
                <span className={formStyles.toggleSlider}></span>
              </div>
            </label>
          </div>
        </div>
        <div className={formStyles.formGroup}>
          <label>Share Ratio</label>
          <input
            type="number"
            placeholder="Enter share ratio"
            value={newEvent.userFraction ?? ""}
            onChange={e =>
              setNewEvent({
                ...newEvent,
                userFraction: e.target.value === "" ? null : parseFloat(e.target.value),
              })
            }
            className={formStyles.formInput}
            min="0"
            max="1"
            step="0.1"
          />
          <span className={formStyles.inputHint}>(If you do not have a spouse, please enter 1.0)</span>
        </div>
      </div>
    </div>
  );
};

export default IncomeEventForm; 