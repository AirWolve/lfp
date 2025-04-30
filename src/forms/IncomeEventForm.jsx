import React from "react";

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
    type: "",
  },
  inflationAdjusted: false,
  userFraction: null,
  socialSecurity: false,
};

const IncomeEventForm = ({ newEvent, setNewEvent }) => {
  const updateChangeDistribution = (type, updates = {}) => {
    // 새로운 distribution 객체를 생성할 때 type만 포함하고
    // 추가 업데이트가 있는 경우에만 해당 필드를 추가
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
    <>
      <label>start Year</label>
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
      <label>Duration for years</label>
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
      <label>Amount change trend</label>
      <select
        value={newEvent.changeAmtOrPct}
        onChange={(e) => {
          const selectedValue = e.target.value;
          setNewEvent((prev) => ({
            ...prev,
            changeAmtOrPct: selectedValue,
            changeDistribution: { type: "" },
          }));
        }}
      >
        <option value="">-- Select Change Type --</option>
        <option value="amount">Amount</option>
        <option value="percent">Percent</option>
      </select>

      <label>Distribution Type</label>
      <select
        value={newEvent.changeDistribution.type ?? "fixed"}
        onChange={(e) => {
          const selectedType = e.target.value;
          updateChangeDistribution(selectedType);
        }}
      >
        <option value="fixed">Fixed Value</option>
        <option value="normal">Normal Distribution</option>
        <option value="uniform">Uniform Distribution</option>
      </select>

      {newEvent.changeDistribution.type === "fixed" && (
        <div>
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
          />
        </div>
      )}

      {newEvent.changeDistribution.type === "normal" && (
        <div>
          <label>Mean {newEvent.changeAmtOrPct === "percent" ? "Percentage" : "Amount"}</label>
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
          <label>Standard Deviation {newEvent.changeAmtOrPct === "percent" ? "Percentage" : "Amount"}</label>
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
      )}

      {newEvent.changeDistribution.type === "uniform" && (
        <div>
          <label>Lower Bound {newEvent.changeAmtOrPct === "percent" ? "Percentage" : "Amount"}</label>
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
          />
          <label>Upper Bound {newEvent.changeAmtOrPct === "percent" ? "Percentage" : "Amount"}</label>
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
          />
        </div>
      )}

      <label>Is it inflation adjusted?</label>
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
      <br />
      <label>
        What is your share ratio?
        <span style={{ fontSize: "11px" }}>
          (If you do not have a spouse, please indicate 1.0)
        </span>
      </label>
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
      />
      <label>Is it social Security?</label>
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
    </>
  );
};

export default IncomeEventForm; 