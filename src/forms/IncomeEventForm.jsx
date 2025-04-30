import React from "react";
import "./FormStyles.css";

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
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const updateChangeDistribution = (type, updates = {}) => {
    // When the type is fixed, the distribution is a fixed value  
    // When the type is normal, the distribution is a normal distribution
    // When the type is uniform, the distribution is a uniform distribution
    // Add additional updates only if they exist
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
      {/* Basic Information Section */}
      <div className="form-section">
        <h3 className="section-title">Basic Information</h3>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={newEvent.name}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter income event name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="start">Start Year</label>
          <input
            type="number"
            id="start"
            name="start"
            value={newEvent.start}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter start year"
          />
        </div>

        <div className="form-group">
          <label htmlFor="duration">Duration (years)</label>
          <input
            type="number"
            id="duration"
            name="duration"
            value={newEvent.duration}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter duration"
          />
        </div>
      </div>

      {/* Amount Section */}
      <div className="form-section">
        <h3 className="section-title">Amount Details</h3>
        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={newEvent.amount}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter amount"
          />
        </div>

        <div className="form-group">
          <label htmlFor="changeTrend">Amount Change Trend</label>
          <select
            id="changeTrend"
            name="changeTrend"
            value={newEvent.changeTrend}
            onChange={handleInputChange}
            className="form-select"
          >
            <option value="fixed">Fixed</option>
            <option value="increase">Increase</option>
            <option value="decrease">Decrease</option>
          </select>
        </div>
      </div>

      {/* Additional Options Section */}
      <div className="form-section">
        <h3 className="section-title">Additional Options</h3>
        <div className="toggle-group">
          <label>
            <span>Inflation Adjusted</span>
            <div className="toggle-switch">
              <input
                type="checkbox"
                name="inflationAdjusted"
                checked={newEvent.inflationAdjusted}
                onChange={handleInputChange}
              />
              <span className="toggle-slider"></span>
            </div>
          </label>
        </div>

        <div className="toggle-group">
          <label>
            <span>Include Social Security</span>
            <div className="toggle-switch">
              <input
                type="checkbox"
                name="socialSecurity"
                checked={newEvent.socialSecurity}
                onChange={handleInputChange}
              />
              <span className="toggle-slider"></span>
            </div>
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="shareRatio">Share Ratio</label>
          <input
            type="number"
            id="shareRatio"
            name="shareRatio"
            value={newEvent.shareRatio}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter share ratio"
            min="0"
            max="1"
            step="0.1"
          />
          <span className="input-hint">Enter a value between 0 and 1</span>
        </div>
      </div>
    </div>
  );
};

export default IncomeEventForm; 