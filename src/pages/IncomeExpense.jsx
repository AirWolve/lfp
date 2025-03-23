import React from "react";
import { useNavigate } from "react-router-dom";
import "./IncomeExpense.css";

const IncomeExpense = () => {
    const navigate = useNavigate();

    const handleNext = (e) => {
      e.preventDefault();
      navigate("/IncomeExpense");
    };

    const handleBack = (e) => {
      e.preventDefault();
      navigate(-1);
    }

    return(
        <div className="scenario-wrapper">
            <div className="form-container">
                <h3>Income & expense setting</h3>
                <p className="form-description">
                    Setting your general information for simulating financial plan. Please follow and input your information.
                </p>
                <form className="info-form">
                    <div className="assetsInfo">
                        <div className="form-row">
                            <div className="form-group">
                            <label>Type of Currency</label>
                            <select>
                                <option>USD</option>
                            </select>
                            </div>
                            
                            <div className="form-group">
                            <label>Monthly Income</label>
                            <input type="number" />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                            <label>Yearly Income</label>
                            <input type="number" />
                            </div>
                            
                            <div className="form-group">
                            <label>Estimated living expenses per month</label>
                            <input type="number" />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                            <label>Input regular expenses</label>
                            <input type="number" />
                            </div>

                            <div className="form-group">
                            <label>Debt</label>
                            <input type="number" />
                            </div>
                        </div>
                        <div className="form-buttons">
                            <button className="back" onClick={handleBack}>Back</button>
                            <button className="next" onClick={handleNext}>Next</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default IncomeExpense;