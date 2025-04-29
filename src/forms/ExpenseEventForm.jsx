import React from "react";

const ExpenseEventForm = ({ newEvent, setNewEvent, incomeEvents }) => {
  return (
    <>
      <label>Start Year with:</label>
      <select
        value={newEvent.start.type || ""}
        onChange={(e) => {
          const selectedType = e.target.value;
          setNewEvent({
            ...newEvent,
            start: {
              ...newEvent.start,
              type: selectedType,
            },
          });
        }}
      >
        <option value="">-- Set Start Year --</option>
        <option value="startWith">Start Year (Same year with income)</option>
        <option value="startAfter">Start Year after income</option>
      </select>
      <label>Income Event</label>
      <select
        value={newEvent.start.eventSeries || ""}
        onChange={(e) => {
          const selectedIncomeId = e.target.value;
          const selectedIncome = incomeEvents.find(
            (income) => income.id === selectedIncomeId
          );

          let startValue;
          if (selectedIncome) {
            if (newEvent.start.type === "startWith") {
              startValue = selectedIncome.start.value;
            } else if (newEvent.start.type === "startAfter") {
              startValue = selectedIncome.start.value + selectedIncome.duration;
            } else {
              startValue = selectedIncome.start.value;
            }
          }

          setNewEvent({
            ...newEvent,
            start: {
              ...newEvent.start,
              eventSeries: selectedIncomeId,
              value: startValue,
            },
          });
        }}
      >
        <option value="">-- Select Income Event --</option>
        {incomeEvents.map((income) => (
          <option key={income.id} value={income.id}>
            {income.name}
          </option>
        ))}
      </select>
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
        onChange={(e) =>
          setNewEvent({
            ...newEvent,
            changeAmtOrPct: e.target.value,
          })
        }
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
      <label>Is it discretionary?</label>
      <input
        type="checkbox"
        checked={newEvent.discretionary}
        onChange={(e) =>
          setNewEvent({
            ...newEvent,
            discretionary: e.target.checked,
          })
        }
      />
    </>
  );
};

export default ExpenseEventForm; 