import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { constPath } from "../config.js";
import "./CashFlow.css";
import profileImg from "../assets/profile.png";
import checkIcon from "../assets/check.svg";

const CashFlow = () => {
    const navigate = useNavigate();
    const [selectedPlans, setSelectedPlans] = useState([]);

    const togglePlan = (plan) => {
        if (selectedPlans.includes(plan)) {
            setSelectedPlans(selectedPlans.filter((p) => p !== plan));
        } else {
            setSelectedPlans([...selectedPlans, plan]);
        }
    };

    const handleBack = (e) => {
        e.preventDefault(false);
        navigate(-1);
    }
    const handleNext = (e) => {
        e.preventDefault(false);
        navigate();
    }

    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const toggleProfileMenu = () => {
        setIsProfileMenuOpen(!isProfileMenuOpen);
      };

    return (
        <div className="main-container">
            <div className="topbar">
                <div className="profile-section">
                    <img
                    src={profileImg}
                    alt="profile"
                    className="profile-img"
                    onClick={toggleProfileMenu}
                    />
                    {isProfileMenuOpen && (
                    <div className="profile-dropdown">
                        <a href={`${constPath.profile}`}>View your profile</a>
                        <a href={`${constPath.home}`}>Log out</a>
                    </div>
                    )}
                </div>
            </div>
            <h2 style={{color: "white", textAlign: "center"}}>Cash Flow Priority</h2>
            <div className="modal-container">
                <h3 style={{textAlign: "center"}}>Step 1</h3>
                <p style={{fontSize: "13px", textAlign: "center"}}>This is where you can choose the type of life financial plan you want. Depending on this, the plan may differ slightly.</p>
                <div className="planSelection">
                    <button
                        className={`plan-button ${selectedPlans.includes("retire") ? "selected retire" : ""}`}
                        onClick={() => togglePlan("retire")}
                    >
                        {selectedPlans.includes("retire") && (
                        <img src={checkIcon} alt="checked" className="check-icon" />
                        )}
                        <h3 className="button-color1">Retirement Plan</h3>
                        <p>Secure your future income with a structured post-retirement savings strategy.</p>
                    </button>

                    <button
                        className={`plan-button ${selectedPlans.includes("personal") ? "selected personal" : ""}`}
                        onClick={() => togglePlan("personal")}
                    >
                        {selectedPlans.includes("personal") && (
                        <img src={checkIcon} alt="checked" className="check-icon" />
                        )}
                        <h3 className="button-color2">Personal Saving Plan</h3>
                        <p>Build a financial cushion for daily needs, emergencies, or short-term goals.</p>
                    </button>

                    <button
                        className={`plan-button ${selectedPlans.includes("invest") ? "selected invest" : ""}`}
                        onClick={() => togglePlan("invest")}
                    >
                        {selectedPlans.includes("invest") && (
                        <img src={checkIcon} alt="checked" className="check-icon" />
                        )}
                        <h3 className="button-color3">Investment Plan</h3>
                        <p>Grow your wealth over time through strategic asset and portfolio allocation.</p>
                    </button>
                </div>
                <div className="form-buttons">
                <button className="back" onClick={handleBack}>Back</button>
                <button className="next" onClick={handleNext}>Next</button>
            </div>
            </div>
            
        </div>
    );
};

export default CashFlow;