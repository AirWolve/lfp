import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { constPath } from "../config.js";
import "../css/BasicSetting.css";
import editIcon from "../assets/editIcon.svg";
import BasicSettingForm, { initialBasicSetting } from "../forms/BasicSettingForm";

const BasicSetting = () => {
  const navigate = useNavigate();

  // Storing Scenario Name which is editing
  const [scenarioName, setScenarioName] = useState("Scenario Name");
  const [isEditing, setIsEditing] = useState(false);
  const [settings, setSettings] = useState(initialBasicSetting);

  // Handling Scenario name edit button
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Handling for changing scenario name
  const handleNameChange = (e) => {
    setScenarioName(e.target.value);
  };

  // For changing the Scenario name
  const handleBlurOrEnter = (e) => {
    if (e.type === "blur" || e.key === "Enter") {
      setIsEditing(false);
    }
  };

  // For loading User's input data
  useEffect(() => {
    const savedUserInfoData = localStorage.getItem("basicInfo");
    if (savedUserInfoData) {
      const parsed = JSON.parse(savedUserInfoData);
      setScenarioName(parsed.name ?? "Scenario Name");
      
      // Convert legacy life expectancy data to new format
      const convertToLifeExpectancy = (value, type = "fixed") => {
        if (value === undefined || value === null) return { type: "fixed", value: null };
        
        switch (type) {
          case "fixed":
            return { type: "fixed", value: value };
          case "normal":
            return {
              type: "normal",
              mean: value?.mean ?? value,
              stdev: value?.stdev ?? 2
            };
          case "uniform":
            return {
              type: "uniform",
              lower: value?.lower ?? (value - 2),
              upper: value?.upper ?? (value + 2)
            };
          default:
            return { type: "fixed", value: value };
        }
      };

      setSettings({
        isCouple: parsed.maritalStatus === "couple",
        userBirthYear: parsed.birthYears?.[0] ?? null,
        spouseBirthYear: parsed.maritalStatus === "couple" ? parsed.birthYears?.[1] : null,
        userLifeExpectancy: convertToLifeExpectancy(
          parsed.lifeExpectancy?.[0],
          parsed.lifeExpectancyType?.[0] ?? "fixed"
        ),
        spouseLifeExpectancy: parsed.maritalStatus === "couple" 
          ? convertToLifeExpectancy(
              parsed.lifeExpectancy?.[1],
              parsed.lifeExpectancyType?.[1] ?? "fixed"
            )
          : { type: "fixed", value: null },
      });
    }
  }, []);

  // Control the buttons
  const handleNext = (e) => {
    e.preventDefault();
    
    // Validation
    const validateLifeExpectancy = (expectancy) => {
      switch (expectancy.type) {
        case "fixed":
          return expectancy.value !== null;
        case "normal":
          return expectancy.mean !== null && expectancy.stdev !== null;
        case "uniform":
          return expectancy.lower !== null && expectancy.upper !== null;
        default:
          return false;
      }
    };

    if (!scenarioName || !settings.userBirthYear || !validateLifeExpectancy(settings.userLifeExpectancy) ||
        (settings.isCouple && (!settings.spouseBirthYear || !validateLifeExpectancy(settings.spouseLifeExpectancy)))) {
      toast.warning("Please fill in all fields");
      return;
    }

    // Save to localStorage
    const getLifeExpectancyValue = (expectancy) => {
      switch (expectancy.type) {
        case "fixed":
          return expectancy.value;
        case "normal":
          return expectancy.mean;
        case "uniform":
          return (expectancy.lower + expectancy.upper) / 2;
        default:
          return null;
      }
    };

    localStorage.setItem(
      "basicInfo",
      JSON.stringify({
        name: scenarioName,
        maritalStatus: settings.isCouple ? "couple" : "individual",
        birthYears: settings.isCouple 
          ? [settings.userBirthYear, settings.spouseBirthYear] 
          : [settings.userBirthYear],
        lifeExpectancy: settings.isCouple
          ? [getLifeExpectancyValue(settings.userLifeExpectancy), getLifeExpectancyValue(settings.spouseLifeExpectancy)]
          : [getLifeExpectancyValue(settings.userLifeExpectancy)],
        lifeExpectancyType: settings.isCouple
          ? [settings.userLifeExpectancy.type, settings.spouseLifeExpectancy.type]
          : [settings.userLifeExpectancy.type],
        lifeExpectancyDetails: settings.isCouple
          ? [settings.userLifeExpectancy, settings.spouseLifeExpectancy]
          : [settings.userLifeExpectancy],
      })
    );
    
    navigate(constPath.investmentType);
  };

  const handleBack = (e) => {
    e.preventDefault();
    navigate(constPath.dashboard);
  };

  return (
    <div className="scenario-wrapper">
      <div className="scenario-title">
        {isEditing ? (
          <input
            type="text"
            value={scenarioName}
            onChange={handleNameChange}
            onBlur={handleBlurOrEnter}
            onKeyDown={handleBlurOrEnter}
            autoFocus
            className="scenario-input"
          />
        ) : (
          <>
            <h2>{scenarioName}</h2>
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

        <BasicSettingForm settings={settings} setSettings={setSettings} />
        
        <div className="form-buttons">
          <button className="back" onClick={handleBack}>
            Back
          </button>
          <button className="next" onClick={handleNext}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default BasicSetting;
