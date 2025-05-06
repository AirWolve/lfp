import React from "react";
import formStyles from '../css/FormStyles.module.css';

/* 
    Initial investment event
    Use the initialInvestEvent to initialize the investment event
*/

export const initialInvestEvent = {
  name: "",
  type: "invest",
  start: {
    type: "fixed",
    value: null,
  },
  duration: {
    type: "fixed",
    value: null,
  },
  glidePath: false,
  maxCash: null,
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
  // Extract the name of the income event series from localStorage
  let incomeSeriesList = [];
  try {
    const allEvents = JSON.parse(localStorage.getItem('EventSeries')) || [];
    incomeSeriesList = Array.from(
      new Set(
        allEvents
          .filter(ev => ev.type === 'income')
          .map(ev => ev.name)
      )
    );
  } catch (e) {
    incomeSeriesList = [];
  }

  // start type and value update function
  const updateStart = (type, updates = {}) => {
    const newStart = { type };
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== null) {
        newStart[key] = value;
      }
    });
    setNewEvent({
      ...newEvent,
      start: newStart,
    });
  };

  return (
    <div className={formStyles.formContainer}>
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
        {/* Start Year Type & Value */}
        <div className={formStyles.formRow}>
          <div className={`${formStyles.formGroup} ${formStyles.flex1}`}>
            <label>Start Year Type</label>
            <select
              value={newEvent.start.type}
              onChange={e => {
                const selectedType = e.target.value;
                updateStart(selectedType);
              }}
              className={formStyles.formSelect}
            >
              <option value="fixed">Fixed</option>
              <option value="normal">Normal</option>
              <option value="uniform">Uniform</option>
              <option value="startWith">Start With</option>
              <option value="startAfter">Start After</option>
            </select>
          </div>
          {/* type-specific input fields */}
          {newEvent.start.type === "fixed" && (
            <div className={`${formStyles.formGroup} ${formStyles.flex1}`}> 
              <label>Start Year</label>
              <input
                type="number"
                placeholder="Enter start year"
                value={newEvent.start.value ?? ""}
                onChange={e =>
                  updateStart("fixed", {
                    value: e.target.value === "" ? null : parseInt(e.target.value, 10),
                  })
                }
                className={formStyles.formInput}
              />
            </div>
          )}
          {newEvent.start.type === "normal" && (
            <>
              <div className={`${formStyles.formGroup} ${formStyles.flex1}`}>
                <label>Mean</label>
                <input
                  type="number"
                  placeholder="Enter mean year"
                  value={newEvent.start.mean ?? ""}
                  onChange={e =>
                    updateStart("normal", {
                      mean: e.target.value === "" ? null : parseFloat(e.target.value),
                      stdev: newEvent.start.stdev,
                    })
                  }
                  className={formStyles.formInput}
                />
              </div>
              <div className={`${formStyles.formGroup} ${formStyles.flex1}`}>
                <label>Standard Deviation</label>
                <input
                  type="number"
                  placeholder="Enter standard deviation"
                  value={newEvent.start.stdev ?? ""}
                  onChange={e =>
                    updateStart("normal", {
                      mean: newEvent.start.mean,
                      stdev: e.target.value === "" ? null : parseFloat(e.target.value),
                    })
                  }
                  className={formStyles.formInput}
                />
              </div>
            </>
          )}
          {newEvent.start.type === "uniform" && (
            <>
              <div className={`${formStyles.formGroup} ${formStyles.flex1}`}>
                <label>Lower Bound</label>
                <input
                  type="number"
                  placeholder="Enter lower bound"
                  value={newEvent.start.lower ?? ""}
                  onChange={e =>
                    updateStart("uniform", {
                      lower: e.target.value === "" ? null : parseFloat(e.target.value),
                      upper: newEvent.start.upper,
                    })
                  }
                  className={formStyles.formInput}
                />
              </div>
              <div className={`${formStyles.formGroup} ${formStyles.flex1}`}>
                <label>Upper Bound</label>
                <input
                  type="number"
                  placeholder="Enter upper bound"
                  value={newEvent.start.upper ?? ""}
                  onChange={e =>
                    updateStart("uniform", {
                      lower: newEvent.start.lower,
                      upper: e.target.value === "" ? null : parseFloat(e.target.value),
                    })
                  }
                  className={formStyles.formInput}
                />
              </div>
            </>
          )}
          {(newEvent.start.type === "startWith" || newEvent.start.type === "startAfter") && (
            <div className={`${formStyles.formGroup} ${formStyles.flex1}`}>
              <label>{newEvent.start.type === "startWith" ? "Start With" : "Start After"} (Income Event Series)</label>
              <select
                value={newEvent.start.eventSeries || ""}
                onChange={e =>
                  updateStart(newEvent.start.type, {
                    eventSeries: e.target.value
                  })
                }
                className={formStyles.formSelect}
              >
                <option value="">-- Select Income Event Series --</option>
                {incomeSeriesList.map(series => (
                  <option key={series} value={series}>{series}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        {/* Duration */}
        <div className={formStyles.formGroup}>
          <label>Duration (years)</label>
          <input
            type="number"
            placeholder="Enter duration in years"
            value={newEvent.duration.value ?? ""}
            onChange={e =>
              setNewEvent({
                ...newEvent,
                duration: { ...newEvent.duration, value: e.target.value === "" ? null : parseInt(e.target.value, 10) },
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

        <div className={formStyles.toggleGroup}>
          <label className={formStyles.toggleLabel}>
            <span>Glide Path</span>
            <div className={formStyles.toggleSwitch}>
              <input
                type="checkbox"
                checked={!!newEvent.glidePath}
                onChange={e =>
                  setNewEvent({
                    ...newEvent,
                    glidePath: e.target.checked,
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
                    setSelectInvestment2("");
                    setAllocationNum2("");
                  }
                }}
                className={`${formStyles.formButton} ${formStyles.allocationAddBtn}`}
              >
                Add
              </button>
            </div>

            <div className={formStyles.formGroup}>
              <h5>Asset Allocations2:</h5>
              <div className={formStyles.allocationGrid}>
                {newEvent.assetAllocation2 &&
                  Object.entries(newEvent.assetAllocation2).map(
                    ([asset, allocation]) => (
                      <div key={asset} className={formStyles.allocationRow}>
                        <span className={formStyles.allocationCell}>{asset}</span>
                        <span className={formStyles.allocationCell}>{allocation}</span>
                        <button
                          onClick={() => {
                            const { [asset]: _, ...rest } =
                              newEvent.assetAllocation2;
                            setNewEvent({
                              ...newEvent,
                              assetAllocation2: rest,
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
        )}

        <div className={formStyles.formGroup}>
          <label>Max Cash</label>
          <input
            type="number"
            placeholder="Enter max cash amount"
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