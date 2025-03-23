import React from "react";
import "./Profile.css";
import profileImg from "../assets/profile.png";

const Profile = () => {

    return(
        <div className="profilePage">
            <div className="topbar">

            </div>
            <div className="userInfo">
                <div className="imageWrap">
                    <img src={profileImg} alt="userImage" style={{width: "60px", height: "60px"}}/>
                </div>
                <p style={{fontSize: "15px"}}>Someone@gmail.com</p>
                <p style={{fontSize: "13px", marginTop: "5px"}}>Last access time: 13:40:30</p>
            </div>
            <div className="profileList">
                <p>Personal Information</p>
                <p>Status</p>
                <p>Saving Senarios</p>
                <p>Export data</p>
                
                <div className="logoutSection">
                    <p style={{fontSize: "14px",fontWeight: "bold", cursor: "pointer", marginBottom: "8px"}}>Log Out</p>
                    <p style={{color:"red", fontSize: "14px", cursor: "pointer"}}>withdraw your account</p>
                </div>
            </div>
        </div>
    );
};

export default Profile;