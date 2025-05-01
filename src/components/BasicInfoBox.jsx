import React from "react";
import { constPath } from "../config.js";
import editIcon from "../assets/editIcon.svg";
import { useNavigate } from "react-router-dom";

const BasicInfoBox = () => {
    const basicInfo = JSON.parse(localStorage.getItem("basicInfo"));
    const navigate = useNavigate();
    console.log("Enter BasicInfoBox");
    return (
        <div className="basic-info-box">
            <div className="basic-info-box-title">
                <h3>Basic Information <button className="boxButton" onClick={() => navigate(constPath.basicSetting)}><img className="editIcon" alt="edit" src={editIcon} /></button></h3>
            </div>
            <div className="basic-info-box-content">
                {basicInfo ? (
                  <div>
                    <p>Scenario Name: {basicInfo.name}</p>
                    <p>Marital Status: {basicInfo.maritalStatus}</p>
                    <p>Birth Years:</p>
                    <ul>
                      <li>User: {basicInfo.birthYears[0]}</li>
                      {basicInfo.maritalStatus === "couple" && <li>Spouse: {basicInfo.birthYears[1]}</li>}
                    </ul>
                    <p>Life Expectancy:</p>
                    <ul>
                      <li>User: {basicInfo.lifeExpectancy[0]}</li>
                      {basicInfo.maritalStatus === "couple" && <li>Spouse: {basicInfo.lifeExpectancy[1]}</li>}
                    </ul>
                  </div>
                ) : (
                  <p>No data exists</p>
                )}
            </div>
        </div>
    );
};

export default BasicInfoBox;