import React from "react";
import formStyles from "../css/BasicForm.module.css";

export const initialBasicSetting = {
  isCouple: false,
  userBirthYear: null,
  spouseBirthYear: null,
  userLifeExpectancy: {
    type: "fixed",
    value: null,
  },
  spouseLifeExpectancy: {
    type: "fixed",
    value: null,
  },
};

/* 
    Basic setting form
    Use the updateLifeExpectancy to update the life expectancy
    Use the renderLifeExpectancyInputs to render the life expectancy inputs
*/

const BasicSettingForm = ({ settings, setSettings }) => {
  // Life expectancy update function
  const updateLifeExpectancy = (person, type, updates = {}) => {
    const newExpectancy = { type };
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== null) {
        newExpectancy[key] = value;
      }
    });

    setSettings({
      ...settings,
      [person === 'user' ? 'userLifeExpectancy' : 'spouseLifeExpectancy']: newExpectancy,
    });
  };

  // Render the life expectancy inputs
  const renderLifeExpectancyInputs = (person, expectancy) => {
    switch (expectancy.type) {
      case "fixed":
        return (
          <div className={formStyles.formGroup}>
            <label>Life Expectancy</label>
            <input
              type="number"
              placeholder="Enter life expectancy"
              value={expectancy.value ?? ""}
              onChange={e =>
                updateLifeExpectancy(person, "fixed", {
                  value: e.target.value === "" ? null : parseInt(e.target.value, 10),
                })
              }
              className={formStyles.formInput}
            />
          </div>
        );
      case "normal":
        // Render the normal distribution inputs
        return (
          <>
            <div className={formStyles.formGroup}>
              <label>Mean</label>
              <input
                type="number"
                placeholder="Enter mean"
                value={expectancy.mean ?? ""}
                onChange={e =>
                  updateLifeExpectancy(person, "normal", {
                    mean: e.target.value === "" ? null : parseFloat(e.target.value),
                    stdev: expectancy.stdev,
                  })
                }
                className={formStyles.formInput}
              />
            </div>
            <div className={formStyles.formGroup}>
              <label>Standard Deviation</label>
              <input
                type="number"
                placeholder="Enter standard deviation"
                value={expectancy.stdev ?? ""}
                onChange={e =>
                  updateLifeExpectancy(person, "normal", {
                    mean: expectancy.mean,
                    stdev: e.target.value === "" ? null : parseFloat(e.target.value),
                  })
                }
                className={formStyles.formInput}
              />
            </div>
          </>
        );
      case "uniform":
        // Render the uniform distribution inputs
        return (
          <>
            <div className={formStyles.formGroup}>
              <label>Lower Bound</label>
              <input
                type="number"
                placeholder="Enter lower bound"
                value={expectancy.lower ?? ""}
                onChange={e =>
                  updateLifeExpectancy(person, "uniform", {
                    lower: e.target.value === "" ? null : parseFloat(e.target.value),
                    upper: expectancy.upper,
                  })
                }
                className={formStyles.formInput}
              />
            </div>
            <div className={formStyles.formGroup}>
              <label>Upper Bound</label>
              <input
                type="number"
                placeholder="Enter upper bound"
                value={expectancy.upper ?? ""}
                onChange={e =>
                  updateLifeExpectancy(person, "uniform", {
                    lower: expectancy.lower,
                    upper: e.target.value === "" ? null : parseFloat(e.target.value),
                  })
                }
                className={formStyles.formInput}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={formStyles.formContainer}>
      {/* Couple Selection */}
      <div className={formStyles.formSection}>
        <div className={formStyles.formRow}>
          <div className={formStyles.labelWrapper}>
            <label>Couple</label>
          </div>
          <div className={formStyles.toggleWrapper}>
            <label className={formStyles.customToggle}>
              <input
                type="checkbox"
                checked={settings.isCouple}
                onChange={(e) => setSettings({ ...settings, isCouple: e.target.checked })}
              />
              <div className={formStyles.toggleButton}>
                <span className={formStyles.toggleOption}>Yes</span>
                <span className={formStyles.toggleOption}>No</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Birth Years */}
      <div className={formStyles.formSection}>
        <div className={formStyles.formRow}>
          <div className={`${formStyles.formGroup} ${formStyles.flex1}`}>
            <label>User Birth Year</label>
            <input
              type="number"
              placeholder="Enter birth year"
              value={settings.userBirthYear ?? ""}
              onChange={e => setSettings({
                ...settings,
                userBirthYear: e.target.value === "" ? null : parseInt(e.target.value, 10)
              })}
              className={formStyles.formInput}
            />
          </div>
          {settings.isCouple && (
            <div className={`${formStyles.formGroup} ${formStyles.flex1}`}>
              <label>Spouse Birth Year</label>
              <input
                type="number"
                placeholder="Enter birth year"
                value={settings.spouseBirthYear ?? ""}
                onChange={e => setSettings({
                  ...settings,
                  spouseBirthYear: e.target.value === "" ? null : parseInt(e.target.value, 10)
                })}
                className={formStyles.formInput}
              />
            </div>
          )}
        </div>
      </div>

      {/* Life Expectancy */}
      <div className={formStyles.formSection}>
        <div className={formStyles.lifeExpectancyContainer}>
          {/* User Life Expectancy */}
          <div className={formStyles.lifeExpectancyBox}>
            <div className={formStyles.boxTitle}>User Life Expectancy</div>
            <div className={formStyles.boxContent}>
              <div className={formStyles.formGroup}>
                <label>Distribution Type</label>
                <select
                  value={settings.userLifeExpectancy.type}
                  onChange={e => {
                    const selectedType = e.target.value;
                    updateLifeExpectancy('user', selectedType);
                  }}
                  className={formStyles.formSelect}
                >
                  <option value="fixed">Fixed</option>
                  <option value="normal">Normal</option>
                  <option value="uniform">Uniform</option>
                </select>
              </div>
              {renderLifeExpectancyInputs('user', settings.userLifeExpectancy)}
            </div>
          </div>

          {/* Spouse Life Expectancy */}
          {settings.isCouple && (
            <div className={formStyles.lifeExpectancyBox}>
              <div className={formStyles.boxTitle}>Spouse Life Expectancy</div>
              <div className={formStyles.boxContent}>
                <div className={formStyles.formGroup}>
                  <label>Distribution Type</label>
                  <select
                    value={settings.spouseLifeExpectancy.type}
                    onChange={e => {
                      const selectedType = e.target.value;
                      updateLifeExpectancy('spouse', selectedType);
                    }}
                    className={formStyles.formSelect}
                  >
                    <option value="fixed">Fixed</option>
                    <option value="normal">Normal</option>
                    <option value="uniform">Uniform</option>
                  </select>
                </div>
                {renderLifeExpectancyInputs('spouse', settings.spouseLifeExpectancy)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BasicSettingForm; 