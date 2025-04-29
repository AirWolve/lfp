import React from "react";

const IncomeEventForm = ({ newEvent, setNewEvent }) => {
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
          }));
        }}
      >
        <option value="">-- Select Notation Type --</option>
        <option value="amount">Notation for Amount</option>
        <option value="percent">Notation for Percent</option>
      </select>
      {/* If user select Amount */}
      <input
        style={{ width: "150px" }}
        type="number"
        placeholder="e.g. 1234"
        value={
          newEvent.changeAmtOrPct === "amount"
            ? newEvent.changeDistribution.lower || null
            : newEvent.changeDistribution.mean || null
        }
        onChange={(e) => {
          const value = parseFloat(e.target.value, 10);
          if (newEvent.changeAmtOrPct === "amount") {
            setNewEvent({
              ...newEvent,
              changeDistribution: {
                ...newEvent.changeDistribution,
                lower: value,
                type: "uniform",
              },
            });
          } else {
            setNewEvent({
              ...newEvent,
              changeDistribution: {
                ...newEvent.changeDistribution,
                mean: value,
                type: "normal",
              },
            });
          }
        }}
      />
      ~
      <input
        style={{ width: "150px" }}
        type="number"
        placeholder="e.g. 5678"
        value={
          newEvent.changeAmtOrPct === "amount"
            ? newEvent.changeDistribution.upper || ""
            : newEvent.changeDistribution.stdev || ""
        }
        onChange={(e) => {
          const value = parseFloat(e.target.value, 10);
          if (newEvent.changeAmtOrPct === "amount") {
            setNewEvent({
              ...newEvent,
              changeDistribution: {
                ...newEvent.changeDistribution,
                upper: value,
              },
            });
          } else {
            setNewEvent({
              ...newEvent,
              changeDistribution: {
                ...newEvent.changeDistribution,
                stdev: value,
              },
            });
          }
        }}
      />
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