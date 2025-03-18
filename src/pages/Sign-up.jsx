import React from "react";
import './Sign-in.css';
import googleLogo from "../assets/google_icon.png";

const Sign_up = () => {

    return (
    <div className="login-container">
        <nav className="navBar">
            <button className="logo">logo</button>
            <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/sign-in">Sign In</a></li>
                <li><a href="/Trial-for-guest">Trial for Guest</a></li>
            </ul>
        </nav>
        <div className="login-box">
            <h2>Creat Account,</h2>
            <p style={{fontSize: "15px", color: "white", marginBottom: "20px"}}>Welcome! Choose how you would like to get started.</p>
            <button className="google-button">
            <img src={googleLogo} alt="Google Logo" className="google-logo"/>
                Sign-up for Google account
            </button>
            <p style={{fontSize:"12px", color: "white", marginTop: "20px"}}>Already have a account? <a href="/Sign-in" className="no-account">Sign-in</a></p>
            <div className="divider"></div>
        </div>
    </div>
    );
};

export default Sign_up;