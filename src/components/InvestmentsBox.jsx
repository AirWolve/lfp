import React from "react";
import editIcon from "../assets/editIcon.svg";
import { useNavigate } from "react-router-dom";
import { constPath } from "../config.js";

const InvestmentsBox = () => {
  const investments = JSON.parse(localStorage.getItem("Investments"));
  const navigate = useNavigate();
  const displayedItems = investments.slice(0, 2);
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
        {investments ? (
          <>
            {displayedItems.map((type, index) => (
              <div key={index} className="investments">
                <p>Name: {type.id}</p>
                <p>Tax Status: {type.taxStatus}</p>
                <p>value: {type.value}</p>
                <br />
              </div>
            ))}
          </>
        ) : (
          <>
            <p> No data exists </p>
          </>
        )}
      </div>
    </div>
  );
};

export default InvestmentsBox;
