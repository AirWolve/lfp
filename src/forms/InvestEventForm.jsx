import React from "react";
import '../css/FormStyles.css';

export const initialInvestEvent = {
  name: "",
  type: "invest",
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
  glidePath: {
    enabled: false,
    endAllocations: [],
  },
  maxCash: 1000,
};

const InvestEventForm = ({
  newEvent,
  setNewEvent,
  assetAllocations,
  selectInvestment,
  setSelectInvestment,
  allocationNum,
  setAllocationNum,
  selectInvestment2,
  setSelectInvestment2,
  allocationNum2,
  setAllocationNum2,
}) => {
  return (
    <>
      <label>Year range:</label>
      <input
        type="number"
        placeholder="Start Year"
        value={newEvent.start.lower}
        onChange={(e) => {
          const lowerValue = parseInt(e.target.value, 10);
          setNewEvent({
            ...newEvent,
            start: {
              ...newEvent.start,
              lower: lowerValue,
              type: "uniform",
            },
          });
        }}
      />
      ~
      <input
        type="number"
        placeholder="End Year (Expected)"
        value={newEvent.start.upper}
        onChange={(e) => {
          const upperValue = parseInt(e.target.value, 10);
          setNewEvent({
            ...newEvent,
            start: {
              ...newEvent.start,
              upper: upperValue,
              type: "uniform",
            },
          });
        }}
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
      {/* Display the list of added asset allocations */}
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
      <label>
        Glide Path:
        <input
          type="checkbox"
          checked={newEvent.glidePath}
          onChange={(e) =>
            setNewEvent({
              ...newEvent,
              glidePath: e.target.checked,
              ...(e.target.checked === false ? { assetAllocation2: "" } : {}),
            })
          }
        />
      </label>
      {/* If glidePath checked */}
      {newEvent.glidePath && (
        <>
          <label>Asset Allocation2</label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <select
              value={selectInvestment2}
              onChange={(e) => setSelectInvestment2(e.target.value)}
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
              value={allocationNum2}
              onChange={(e) => setAllocationNum2(e.target.value, 10)}
              style={{ width: "50px" }}
            />
            <button
              onClick={() => {
                if (selectInvestment2 && allocationNum2) {
                  const allocationValue = parseFloat(allocationNum2);
                  setNewEvent({
                    ...newEvent,
                    assetAllocation2: {
                      ...newEvent.assetAllocation2,
                      [selectInvestment2]: allocationValue,
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
          {/* Display the list of added asset allocations */}
          <div style={{ marginTop: "10px" }}>
            <h5>Asset Allocations2:</h5>
            <ul>
              {newEvent.assetAllocation2 &&
                Object.entries(newEvent.assetAllocation2).map(
                  ([asset, allocation]) => (
                    <li key={asset}>
                      {asset}: {allocation}{" "}
                      <button
                        onClick={() => {
                          const { [asset]: _, ...rest } =
                            newEvent.assetAllocation2;
                          setNewEvent({
                            ...newEvent,
                            assetAllocation2: rest,
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
      )}
      <label>Cash (Max 1000)</label>
      <input
        type="number"
        placeholder="0 ~ 1000"
        value={newEvent.maxCash}
        onChange={(e) => {
          const val = parseInt(e.target.value, 10);
          setNewEvent({ ...newEvent, maxCash: val });
        }}
      />
    </>
  );
};

export default InvestEventForm; 