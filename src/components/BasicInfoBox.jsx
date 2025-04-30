import React from "react";

const BasicInfoBox = () => {

    const basicInfo = JSON.parse(localStorage.getItem("basicInfo"));

    return (
        <div className="basic-info-box">
            <div className="basic-info-box-title">
                <h3>Basic Information</h3>
            </div>
            <div className="basic-info-box-content">
                <p>Senario Name: {basicInfo.name}</p>
                <p>Marital Status: {basicInfo.isCouple ? "Married" : "Single"}</p>
                <p>Birth Years:</p>
                <ul>
                    <li>User: {basicInfo.userBirthYear}</li>
                    {basicInfo.isCouple && <li>Spouse: {basicInfo.spouseBirthYear}</li>}
                </ul>
                <p>life Expectancy:</p>
                <ul>
                    <li>User: {basicInfo.lifeExpectancy}</li>
                    {basicInfo.isCouple && <li>Spouse: {basicInfo.spouseLifeExpectancy}</li>}
                </ul>
            </div>
        </div>
    );
};

export default BasicInfoBox;