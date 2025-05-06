import React from "react";
import { constPath } from "../config.js";
import editIcon from "../assets/editIcon.svg";
import { useNavigate } from "react-router-dom";

/* 
    Display basic information of the user
    Edit button to navigate to the basic setting page
    To show the basic information, use component to render the information
*/

const BasicInfoBox = () => {
    const basicInfo = JSON.parse(localStorage.getItem("basicInfo")) ?? null;
    const navigate = useNavigate();
    console.log(basicInfo);

    const safeRender = (value) => {
        if (value === null || value === undefined) return 'N/A';
        try {
            return typeof value === 'object' ? JSON.stringify(value) : String(value);
        } catch (e) {
            console.error('Error rendering value:', e);
            return 'Error';
        }
    };

    return (
        <div className="basic-info-box">
            <div className="basic-info-box-title">
                <h3>Basic Information <button className="boxButton" onClick={() => navigate(constPath.basicSetting)}><img className="editIcon" alt="edit" src={editIcon} /></button></h3>
            </div>
            <div className="basic-info-box-content">
                {basicInfo ? (
                    <div>
                        <p>Scenario Name: {safeRender(basicInfo.name)}</p>
                        <p>Marital Status: {safeRender(basicInfo.maritalStatus)}</p>
                        <p>Birth Years:</p>
                        <ul>
                            <li>User: {safeRender(basicInfo.birthYears?.[0])}</li>
                            {basicInfo.maritalStatus === "couple" && (
                                <li>Spouse: {safeRender(basicInfo.birthYears?.[1])}</li>
                            )}
                        </ul>
                        <p>Life Expectancy:</p>
                        <ul>
                            <li>User: {safeRender(basicInfo.lifeExpectancy?.[0])}</li>
                            {basicInfo.maritalStatus === "couple" && (
                                <li>Spouse: {safeRender(basicInfo.lifeExpectancy?.[1])}</li>
                            )}
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