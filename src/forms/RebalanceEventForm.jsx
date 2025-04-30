import React from "react";
import formStyles from '../css/FormStyles.module.css';

export const initialRebalanceEvent = {
  name: "",
  type: "rebalance",
  start: {
    type: "fixed",
    value: null,
  },
  duration: {
    type: "fixed",
    value: null,
  },
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
    <div className={formStyles.formContainer}>
      <div className={formStyles.formSection}>
        <div className={formStyles.sectionTitle}>기본 정보</div>
        <div className={formStyles.formGroup}>
          <label>Year range:</label>
          <div className={formStyles.formRow}>
            <div className={`${formStyles.formGroup} ${formStyles.flex1}`}>
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
                className={formStyles.formInput}
              />
            </div>
            <div className={`${formStyles.formGroup} ${formStyles.flex1}`}>
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
                className={formStyles.formInput}
              />
            </div>
          </div>
        </div>

        <div className={formStyles.formGroup}>
          <label>Duration (year)</label>
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
            className={formStyles.formInput}
          />
        </div>
      </div>

      <div className={formStyles.formSection}>
        <div className={formStyles.sectionTitle}>Asset Allocation</div>
        <div className={formStyles.formGroup}>
          <label>Asset Allocation (%)</label>
          <div className={formStyles.formRow}>
            <div className={`${formStyles.formGroup} ${formStyles.flex1}`}>
              <select
                value={selectInvestment}
                onChange={(e) => setSelectInvestment(e.target.value)}
                className={formStyles.formSelect}
              >
                <option value="">-- Select --</option>
                {assetAllocations.map((alloc, idx) => (
                  <option key={idx} value={alloc}>
                    {alloc}
                  </option>
                ))}
              </select>
            </div>
            <div className={`${formStyles.formGroup} ${formStyles.flex1}`}>
              <input
                type="number"
                placeholder="e.g. 0.4"
                value={allocationNum}
                onChange={(e) => setAllocationNum(e.target.value, 10)}
                className={formStyles.formInput}
              />
            </div>
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
              className={`${formStyles.formButton} ${formStyles.allocationAddBtn}`}
            >
              Add
            </button>
          </div>
        </div>

        <div className={formStyles.formGroup}>
          <h5>Asset Allocations:</h5>
          <div className={formStyles.allocationGrid}>
            {newEvent.assetAllocation &&
              Object.entries(newEvent.assetAllocation).map(
                ([asset, allocation]) => (
                  <div key={asset} className={formStyles.allocationRow}>
                    <span className={formStyles.allocationCell}>{asset}</span>
                    <span className={formStyles.allocationCell}>{allocation}</span>
                    <button
                      onClick={() => {
                        const { [asset]: _, ...rest } = newEvent.assetAllocation;
                        setNewEvent({
                          ...newEvent,
                          assetAllocation: rest,
                        });
                      }}
                      className={formStyles.allocationRemoveBtn}
                    >
                      Remove
                    </button>
                  </div>
                )
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RebalanceEventForm; 