import React from "react";
import editIcon from "../assets/editIcon.svg";
import { useNavigate } from "react-router-dom";
import { constPath } from "../config.js";

const InvestmentTypeBox = () => {
  const investmentType = JSON.parse(localStorage.getItem("InvestmentTypes")) ?? null;
  const navigate = useNavigate();
  console.log(investmentType);

  const safeRender = (value) => {
    if (value === null || value === undefined) return 'N/A';
    try {
      return typeof value === 'object' ? JSON.stringify(value) : String(value);
    } catch (e) {
      console.error('Error rendering value:', e);
      return 'Error';
    }
  };

  const displayedItems = investmentType?.slice(0, 2) ?? [];

  return (
    <div className="basic-info-box">
      <div className="basic-info-box-title">
        <h3>
          Invest Type Information
          <button
            className="boxButton"
            onClick={() => navigate(constPath.investmentType)}
          >
            <img className="editIcon" alt="edit" src={editIcon} />
          </button>
        </h3>
      </div>
      <div className="basic-info-box-content">
        {investmentType && investmentType.length > 0 ? (
          displayedItems.map((type, index) => (
            <div key={index} className="investment-type">
              <p>Name: {safeRender(type.name)}</p>
              <p>Description: {safeRender(type.description)}</p>
              <p>Taxability: {safeRender(type.taxability)}</p>
              <br />
            </div>
          ))
        ) : (
          <p>No data exists</p>
        )}
      </div>
    </div>
  );
};

export default InvestmentTypeBox;
