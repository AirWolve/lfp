import React from "react";
import "../css/FormStyles.css";

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
    <div className="form-container">
      <div className="form-section">
        <div className="form-row">
          <div className="form-group">
            <label>Start Year</label>
            <input
              type="number"
              placeholder="e.g. 2025"
              value={newEvent.start.value}
              onChange={(e) =>
                setNewEvent({
                  ...newEvent,
                  start: {
                    ...newEvent.start,
                    value: parseInt(e.target.value, 10) || 0,
                  },
                })
              }
            />
          </div>
          <div className="form-group">
            <label>Duration (years)</label>
            <input
              type="number"
              placeholder="e.g. 20"
              value={newEvent.duration.value}
              onChange={(e) =>
                setNewEvent({
                  ...newEvent,
                  duration: {
                    ...newEvent.duration,
                    value: parseInt(e.target.value, 10) || 0,
                  },
                })
              }
            />
          </div>
        </div>

        <div className="form-group">
          <label>Amount</label>
          <input
            type="number"
            placeholder="e.g. 1234"
            value={newEvent.initialAmount}
            onChange={(e) =>
              setNewEvent({
                ...newEvent,
                initialAmount: parseFloat(e.target.value, 10),
              })
            }
          />
        </div>

        <div className="form-row">
          <div className="form-group flex-1">
            <label>Change Type</label>
            <select
              value={newEvent.changeAmtOrPct}
              onChange={(e) => {
                const selectedValue = e.target.value;
                setNewEvent((prev) => ({
                  ...prev,
                  changeAmtOrPct: selectedValue,
                  changeDistribution: { type: "fixed", value: null },
                }));
              }}
            >
              <option value="">-- Select Change Type --</option>
              <option value="amount">Amount</option>
              <option value="percent">Percent</option>
            </select>
          </div>

          <div className="form-group flex-1">
            <label>Distribution Type</label>
            <select
              value={newEvent.changeDistribution.type}
              onChange={(e) => {
                const selectedType = e.target.value;
                updateChangeDistribution(selectedType);
              }}
            >
              <option value="fixed">Fixed Value</option>
              <option value="normal">Normal Distribution</option>
              <option value="uniform">Uniform Distribution</option>
            </select>
          </div>
        </div>

        {newEvent.changeDistribution.type === "fixed" && (
          <div className="form-group">
            <label>Fixed {newEvent.changeAmtOrPct === "percent" ? "Percentage" : "Amount"}</label>
            <input
              type="number"
              placeholder={newEvent.changeAmtOrPct === "percent" ? "e.g. 2.5" : "e.g. 1000"}
              value={newEvent.changeDistribution.value ?? ""}
              onChange={(e) =>
                updateChangeDistribution("fixed", {
                  value: e.target.value === "" ? null : parseFloat(e.target.value),
                })
              }
              style={{ WebkitAppearance: "none", MozAppearance: "textfield" }}
            />
          </div>
        )}

        {newEvent.changeDistribution.type === "normal" && (
          <div className="form-row">
            <div className="form-group flex-1">
              <label>Mean {newEvent.changeAmtOrPct === "percent" ? "%" : ""}</label>
              <input
                type="number"
                placeholder={newEvent.changeAmtOrPct === "percent" ? "e.g. 2.5" : "e.g. 1000"}
                value={newEvent.changeDistribution.mean ?? ""}
                onChange={(e) =>
                  updateChangeDistribution("normal", {
                    mean: e.target.value === "" ? null : parseFloat(e.target.value),
                    stdev: newEvent.changeDistribution.stdev,
                  })
                }
                style={{ WebkitAppearance: "none", MozAppearance: "textfield" }}
              />
            </div>
            <div className="form-group flex-1">
              <label>Std Dev {newEvent.changeAmtOrPct === "percent" ? "%" : ""}</label>
              <input
                type="number"
                placeholder={newEvent.changeAmtOrPct === "percent" ? "e.g. 0.5" : "e.g. 200"}
                value={newEvent.changeDistribution.stdev ?? ""}
                onChange={(e) =>
                  updateChangeDistribution("normal", {
                    mean: newEvent.changeDistribution.mean,
                    stdev: e.target.value === "" ? null : parseFloat(e.target.value),
                  })
                }
                style={{ WebkitAppearance: "none", MozAppearance: "textfield" }}
              />
            </div>
          </div>
        )}

        {newEvent.changeDistribution.type === "uniform" && (
          <div className="form-row">
            <div className="form-group flex-1">
              <label>Lower Bound {newEvent.changeAmtOrPct === "percent" ? "%" : ""}</label>
              <input
                type="number"
                placeholder={newEvent.changeAmtOrPct === "percent" ? "e.g. 1.5" : "e.g. 500"}
                value={newEvent.changeDistribution.lower ?? ""}
                onChange={(e) =>
                  updateChangeDistribution("uniform", {
                    lower: e.target.value === "" ? null : parseFloat(e.target.value),
                    upper: newEvent.changeDistribution.upper,
                  })
                }
                style={{ WebkitAppearance: "none", MozAppearance: "textfield" }}
              />
            </div>
            <div className="form-group flex-1">
              <label>Upper Bound {newEvent.changeAmtOrPct === "percent" ? "%" : ""}</label>
              <input
                type="number"
                placeholder={newEvent.changeAmtOrPct === "percent" ? "e.g. 3.5" : "e.g. 2000"}
                value={newEvent.changeDistribution.upper ?? ""}
                onChange={(e) =>
                  updateChangeDistribution("uniform", {
                    lower: newEvent.changeDistribution.lower,
                    upper: e.target.value === "" ? null : parseFloat(e.target.value),
                  })
                }
                style={{ WebkitAppearance: "none", MozAppearance: "textfield" }}
              />
            </div>
          </div>
        )}

        <div className="form-row options-row">
          <div className="toggle-group">
            <label className="toggle-label">
              <span>Inflation Adjusted</span>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  checked={newEvent.inflationAdjusted}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      inflationAdjusted: e.target.checked,
                    })
                  }
                />
                <span className="toggle-slider"></span>
              </div>
            </label>
          </div>

          <div className="toggle-group">
            <label className="toggle-label">
              <span>Social Security</span>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  checked={newEvent.socialSecurity}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      socialSecurity: e.target.checked,
                    })
                  }
                />
                <span className="toggle-slider"></span>
              </div>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Share Ratio</label>
          <input
            type="number"
            placeholder="e.g. 0.3"
            value={newEvent.userFraction}
            onChange={(e) =>
              setNewEvent({
                ...newEvent,
                userFraction: parseFloat(e.target.value, 10),
              })
            }
            min="0"
            max="1"
            step="0.1"
          />
          <span className="input-hint">(If you do not have a spouse, please indicate 1.0)</span>
        </div>
      </div>
    </div>
  );
};

export default IncomeEventForm; 