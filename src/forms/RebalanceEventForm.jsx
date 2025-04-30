import React from "react";
import '../css/FormStyles.css';

export const initialRebalanceEvent = {
  name: "",
  type: "rebalance",
  start: {
    type: "fixed",
    value: null,
  },
  end: {
    type: "fixed",
    value: null,
  },
  duration: {
    type: "fixed",
    value: null,
  },
  assetAllocations: [],
};

const RebalanceEventForm = ({
  newEvent,
  setNewEvent,
  assetAllocations,
  selectInvestment,
  setSelectInvestment,
  allocationNum,
  setAllocationNum,
}) => {
  return (
    <>
      <label>Year range:</label>
      <input
        type="number"
        placeholder="Start Year"
        value={newEvent.start.lower}
        onChange={(e) =>
          setNewEvent({
            ...newEvent,
            start: parseInt(e.target.value, 10),
          })
        }
      />
      ~
      <input
        type="number"
        placeholder="End Year (Expected)"
        value={newEvent.start.upper}
        onChange={(e) =>
          setNewEvent({
            ...newEvent,
            start: parseInt(e.target.value, 10),
          })
        }
      />
      <input
        type="number"
        placeholder="Duration (year)"
        value={newEvent.duration}
        onChange={(e) =>
          setNewEvent({
            ...newEvent,
            duration: parseInt(e.target.value, 10),
          })
        }
      />
      <label>Asset Allocation (%) </label>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <select
          value={selectInvestment}
          onChange={(e) => setSelectInvestment(e.target.value)}
        >
          <option value="">-- Select --</option>
          {assetAllocations.map((alloc, idx) => (
            <option key={idx} value={alloc}>
              {alloc}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="e.g. 0.4"
          value={allocationNum}
          onChange={(e) => setAllocationNum(e.target.value, 10)}
          style={{ width: "50px" }}
        />
        <button
          onClick={() => {
            if (selectInvestment && allocationNum) {
              const allocationValue = parseFloat(allocationNum);
              setNewEvent({
                ...newEvent,
                assetAllocation: {
                  ...newEvent.assetAllocation,
                  [selectInvestment]: allocationValue,
                },
              });
              setSelectInvestment("");
              setAllocationNum("");
            }
          }}
        >
          Add
        </button>
      </div>
      {/* Display the list of added assetAllocations */}
      <div style={{ marginTop: "10px" }}>
        <h5>Asset Allocations:</h5>
        <ul>
          {newEvent.assetAllocation &&
            Object.entries(newEvent.assetAllocation).map(
              ([asset, allocation]) => (
                <li key={asset}>
                  {asset}: {allocation}{" "}
                  <button
                    onClick={() => {
                      const { [asset]: _, ...rest } = newEvent.assetAllocation;
                      setNewEvent({
                        ...newEvent,
                        assetAllocation: rest,
                      });
                    }}
                  >
                    Remove
                  </button>
                </li>
              )
            )}
        </ul>
      </div>
    </>
  );
};

export default RebalanceEventForm; 