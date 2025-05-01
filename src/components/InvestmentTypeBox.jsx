import React from "react";
import editIcon from "../assets/editIcon.svg";
import { useNavigate } from "react-router-dom";
import { constPath } from "../config.js";
import InvestmentType from "../pages/InvestmentType";

const InvestmentTypeBox = () => {
  const investmentType = JSON.parse(localStorage.getItem("InvestmentTypes"));
  const navigate = useNavigate();
  const displayedItems = investmentType.slice(0, 2);
  console.log("Enter InvestmentTypeBox");

  return (
    <div className="basic-info-box">
      <div className="basic-info-box-title">
        <h3>
          Invest Type Information{" "}
          <button
            className="boxButton"
            onClick={() => navigate(constPath.investmentType)}
          >
            <img className="editIcon" alt="edit" src={editIcon} />
          </button>
        </h3>
      </div>
      <div className="basic-info-box-content">
        {investmentType ? (
            displayedItems.map((type, index) => (
              <div key={index} className="investment-type">
                <p>Name: {type.name}</p>
                <p>Description: {type.description}</p>
                <p>Taxability: {type.taxability ? "true" : "false"}</p>
                <br />
              </div>
            ))
        ) : (
            <p> No data exists </p>
        )}
      </div>
    </div>
  );
};

export default InvestmentTypeBox;
