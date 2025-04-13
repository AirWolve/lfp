import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { constPath } from "../config.js";
import "./BasicSetting.css";
import editIcon from "../assets/editIcon.svg";

const BasicSetting = () => {
  const navigate = useNavigate();

  //Storing Scenario Name which is editing
  const [ScenarioName, setScenarioName] = useState("Scenario Name");
  const [isEditing, setIsEditing] = useState(false);

  //Storage user's basic information
  const [isCouple, setIsCouple] = useState(false);
  const [birthYear, setBirthYear] = useState();
  const [spouseBirthYear, setSpouseBirthYear] = useState();
  const [lifeExpectancy, setLifeExpectancy] = useState();
  const [spouseLifeExpectancy, setSpouseLifeExpectancy] = useState();

  //Handling Scenario name edit button
  const handleEditClick = () => {
    setIsEditing(true);
  };

  //Handling for changing sceanrio name
  const handleNameChange = (e) => {
    setScenarioName(e.target.value);
  };

  //For changing the Scenario name
  const handleBlurOrEnter = (e) => {
    if (e.type === "blur" || e.key === "Enter") {
      setIsEditing(false);
    }
  };

  const handleCouple = (e) => {
    setIsCouple(e.target.value === "yes");
  };

  //For loading User's input data
  //For asking ChatGPT, "How can I set to maintain showing data on front even if user return(back) to this
  //page from next page"?
  useEffect(() => {
    const saveUserInfoData = localStorage.getItem("basicInfo");
    if (saveUserInfoData) {
      const parsed = JSON.parse(saveUserInfoData);
      setScenarioName(parsed.ScenarioName ?? "Scenario Name");
      setIsCouple(parsed.maritalStatus === "couple");
      setBirthYear(parsed.birthYears?.[0] ?? undefined);
      setSpouseBirthYear(
        parsed.maritalStatus === "couple" ? parsed.birthYears?.[1] : undefined
      );
      setLifeExpectancy(parsed.lifeExpectancy?.[0] ?? undefined);
      setSpouseLifeExpectancy(
        parsed.maritalStatus === "couple"
          ? parsed.lifeExpectancy?.[1]
          : undefined
      );
    }
  }, []);

  // Control the buttons
  // Storing if user click next.
  const handleNext = (e) => {
    e.preventDefault();
    localStorage.setItem(
      "basicInfo",
      JSON.stringify({
        name: ScenarioName,
        maritalStatus: isCouple ? "couple" : "individual",
        birthYears: isCouple ? [birthYear, spouseBirthYear] : [birthYear],
        lifeExpectancy: isCouple
          ? [lifeExpectancy, spouseLifeExpectancy]
          : [lifeExpectancy],
      })
    );
    navigate(`${constPath.investmentType}`);
  };

  const handleBack = (e) => {
    e.preventDefault();
    navigate(`${constPath.dashboard}`);
  };

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
            className="scenario-input"
          />
        ) : (
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
          Setting your general information for simulating financial plan. Please
          follow and input your information.
        </p>

        <form className="info-form">
          <div className="form-row">
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
                  />{" "}
                  Yes
                </label>
                <label>
                  <input
                    type="radio"
                    name="married"
                    value="no"
                    checked={!isCouple}
                    onChange={handleCouple}
                  />{" "}
                  No
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
                <div className="form-row">
                  <label>User Life expectancy</label>

                  <input
                    type="fixed"
                    placeholder="e.g. 85"
                    value={lifeExpectancy}
                    onChange={(e) => setLifeExpectancy(e.target.value)}
                  />

                  <label>Spouse Life expectancy</label>
                  <input
                    type="fixed"
                    placeholder="e.g. 85"
                    value={spouseLifeExpectancy}
                    onChange={(e) => setSpouseLifeExpectancy(e.target.value)}
                  />
                </div>
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
                <label>User Life expectancy</label>
                <input
                  type="fixed"
                  placeholder="e.g. 85"
                  value={lifeExpectancy}
                  onChange={(e) => setLifeExpectancy(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="form-buttons">
            <button className="back" onClick={handleBack}>
              Back
            </button>
            <button className="next" onClick={handleNext}>
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BasicSetting;
