import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { constPath } from "../config.js";
import "./BasicSetting.css";
import editIcon from "../assets/editIcon.svg";

const BasicSetting = () => {
    const navigate = useNavigate();

    const handleNext = (e) => {
      e.preventDefault();
      navigate(`${constPath.investmentType}`);
    };

    const handleBack = (e) => {
      e.preventDefault();
      navigate(`${constPath.dashboard}`);
    }

    const [ScenarioName, setScenarioName] = useState("Scenario Name");
    const [isEditing, setIsEditing] = useState(false);
    const [isCouple, setIsCouple] = useState(false);
    const [birthYear, setBirthYear] = useState();
    const [spouseBirthYear, setSpouseBirthYear] = useState();

    const handleEditClick = () => {
        setIsEditing(true);
    };
    
    const handleNameChange = (e) => {
        setScenarioName(e.target.value);
    };

    const handleBlurOrEnter = (e) => {
        if (e.type === "blur" || e.key === "Enter") {
            setIsEditing(false);
        }
    };

    const handleCouple = (e) => {
      setIsCouple(e.target.value === "yes");
    }

    return (
      <div className="scenario-wrapper">
        <div className="scenario-title">
          {isEditing ? (
              <input 
              type="text" 
              value={ScenarioName} 
              onChange={handleNameChange} 
              onBlur={handleBlurOrEnter}
              onKeyDown={handleBlurOrEnter}
              autoFocus
              className="scenario-input" />
          ): (
              <>
                  <h2>{ScenarioName}</h2>
              <img
                src={editIcon}
                alt="edit"
                className="edit-icon"
                onClick={handleEditClick}
              />
              </>
          )}
        </div>

        <div className="form-container">
          <h3>Basic information Setting</h3>
          <p className="form-description">
            Setting your general information for simulating financial plan. Please follow and input your information.
          </p>

          <form className="info-form">
            <div className="form-row">
              <label>Nationality</label>
              <select>
                <option>American</option>
                <option>Other</option>
              </select>
              <div className="form-row">
                <label>Couple</label>
                <div className="radio-group">
                  <label>
                    <input 
                    type="radio" 
                    name="married" 
                    value="yes" 
                    checked={isCouple} 
                    onChange={handleCouple}
                    /> {" "} Yes
                  </label>
                  <label>
                    <input 
                    type="radio" 
                    name="married" 
                    value="no" 
                    checked={!isCouple} 
                    onChange={handleCouple}
                    /> {" "} No
                    </label>
                </div>
              </div>
              {isCouple && (
                <div className="form-row">
                  <label>User Birth Year</label>
                  <input
                  type="fixed"
                  placeholder="e.g. 1980"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  />
                  <label>Spouse Birth Year</label>
                  <input
                  type="fixed"
                  placeholder="e.g. 1980"
                  value={spouseBirthYear}
                  onChange={(e) => setSpouseBirthYear(e.target.value)}
                  />
                </div>
              )}
              {!isCouple && (
                <div className="form-row">
                  <label>User Birth Year</label>
                  <input
                  type="fixed"
                  placeholder="e.g. 1980"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="form-row">
              <label>Retirement age</label>
              <input type="number" placeholder="e.g. 65" />

              <label>Life expectancy</label>
              <input type="fixed" placeholder="e.g. 85" />
            </div>

            <div className="form-buttons">
              <button className="back" onClick={handleBack}>Back</button>
              <button className="next" onClick={handleNext}>Next</button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default BasicSetting;
