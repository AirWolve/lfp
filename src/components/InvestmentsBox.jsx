import React from "react";
import editIcon from "../assets/editIcon.svg";
import { useNavigate } from "react-router-dom";
import { constPath } from "../config.js";

/* 
    Display investment information
    Edit button to navigate to the investment setting page
    To show the investment information, use component to render the information
*/

const InvestmentsBox = () => {
  const investments = JSON.parse(localStorage.getItem("Investments")) ?? null;
  const navigate = useNavigate();
  console.log(investments);

  const safeRender = (value) => {
    if (value === null || value === undefined) return 'N/A';
    try {
      return typeof value === 'object' ? JSON.stringify(value) : String(value);
    } catch (e) {
      console.error('Error rendering value:', e);
      return 'Error';
    }
  };

  const displayedItems = investments?.slice(0, 2) ?? [];
  
  return (
    <div className="basic-info-box">
      <div className="basic-info-box-title">
        <h3>
          Investments Information{" "}
          <button
            className="boxButton"
            onClick={() => navigate(constPath.investments)}
          >
            <img className="editIcon" alt="edit" src={editIcon} />
          </button>
        </h3>
      </div>
      <div className="basic-info-box-content">
        {investments && investments.length > 0 ? (
          displayedItems.map((type, index) => (
            <div key={index} className="investments">
              <p>Name: {safeRender(type.id)}</p>
              <p>Tax Status: {safeRender(type.taxStatus)}</p>
              <p>Value: {safeRender(type.value)}</p>
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

export default InvestmentsBox;
