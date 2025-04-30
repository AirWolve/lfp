import React from "react";
import formStyles from '../css/FormStyles.module.css';

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
                className={formStyles.formInput}
              />
            </div>
            <div className={`${formStyles.formGroup} ${formStyles.flex1}`}>
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
              className={formStyles.formButton}
            >
              Add
            </button>
          </div>
        </div>

        <div className={formStyles.formGroup}>
          <h5>Asset Allocations:</h5>
          <ul className={formStyles.allocationList}>
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
                      className={formStyles.formButton}
                    >
                      Remove
                    </button>
                  </li>
                )
              )}
          </ul>
        </div>

        <div className={formStyles.toggleGroup}>
          <label className={formStyles.toggleLabel}>
            <span>Glide Path</span>
            <div className={formStyles.toggleSwitch}>
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
              <span className={formStyles.toggleSlider}></span>
            </div>
          </label>
        </div>

        {newEvent.glidePath && (
          <div className={formStyles.formGroup}>
            <label>Asset Allocation2</label>
            <div className={formStyles.formRow}>
              <div className={`${formStyles.formGroup} ${formStyles.flex1}`}>
                <select
                  value={selectInvestment2}
                  onChange={(e) => setSelectInvestment2(e.target.value)}
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
                  value={allocationNum2}
                  onChange={(e) => setAllocationNum2(e.target.value, 10)}
                  className={formStyles.formInput}
                />
              </div>
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
                className={formStyles.formButton}
              >
                Add
              </button>
            </div>

            <div className={formStyles.formGroup}>
              <h5>Asset Allocations2:</h5>
              <ul className={formStyles.allocationList}>
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
                          className={formStyles.formButton}
                        >
                          Remove
                        </button>
                      </li>
                    )
                  )}
              </ul>
            </div>
          </div>
        )}

        <div className={formStyles.formGroup}>
          <label>Cash (Max 1000)</label>
          <input
            type="number"
            placeholder="0 ~ 1000"
            value={newEvent.maxCash}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setNewEvent({ ...newEvent, maxCash: val });
            }}
            className={formStyles.formInput}
          />
        </div>
      </div>
    </div>
  );
};

export default InvestEventForm; 