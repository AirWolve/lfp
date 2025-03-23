import React from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import profileImg from "../assets/profile.png";
import backIcon from "../assets/backArrow.svg";

const Profile = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/Dashboard");
  };

  return (
    <div>
      <div className="topbar">
        <button className="backButton" onClick={handleBack}>
          <img src={backIcon} alt="back" className="backIcon" />
        </button>
      </div>

      <div className="profilePage">
        <div className="userInfo">
          <div className="imageWrap">
            <img src={profileImg} alt="userImage" style={{ width: "60px", height: "60px" }} />
          </div>
          <p style={{ fontSize: "15px" }}>Someone@gmail.com</p>
          <p style={{ fontSize: "13px", marginTop: "5px" }}>Last access time: 13:40:30</p>
        </div>

        <div className="profileList">
          <p>Personal Information</p>
          <p>Status</p>
          <p>Saving Senarios</p>
          <p>Export data</p>

          <div className="logoutSection">
            <p style={{ fontSize: "14px", cursor: "pointer", marginTop: "300px", marginBottom: "8px" }}>
              Log Out
            </p>
            <p style={{ color: "red", fontSize: "14px", cursor: "pointer" }}>withdraw your account</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
