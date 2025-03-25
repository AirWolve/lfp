import React from "react";
import "./SignIn.css";
import googleLogo from "../assets/google_icon.png";
import { constPath } from "../config.js";

const SignIn = () => {
  const handleLogin = () => {
    window.location.href = `${process.env.REACT_APP_LFP_API_URL}/auth/oauth/google`;
  };

  return (
    <div className="login-container">
      <nav className="navBar">
        <button className="logo">logo</button>
        <ul>
          <li>
            <a href={`${constPath.home}`}>Home</a>
          </li>
          <li>
            <a href={`${constPath.signIn}`}>Sign In</a>
          </li>
          <li>
            <a href={`${constPath.trialForGuest}`}>Trial for Guest</a>
          </li>
        </ul>
      </nav>
      <div className="login-box">
        <h2>Welcome aboard,</h2>
        <button className="google-button" onClick={handleLogin}>
          <img src={googleLogo} alt="Google Logo" className="google-logo" />
          Sign-in for Google account
        </button>
        <p style={{ fontSize: "12px", color: "white" }}>
          You have no account?{" "}
          <a href={`${constPath.signUp}`} className="no-account">
            Create account
          </a>
        </p>
        <div className="divider"></div>
      </div>
    </div>
  );
};

export default SignIn;
