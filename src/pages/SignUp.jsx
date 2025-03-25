import React from "react";
import "./SignIn.css";
import googleLogo from "../assets/google_icon.png";
import { constPath } from "../config.js";

const SignUp = () => {
  const handleSignUp = () => {
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
            <a href={`${constPath.signUp}`}>Sign In</a>
          </li>
          <li>
            <a href={`${constPath.trialForGuest}`}>Trial for Guest</a>
          </li>
        </ul>
      </nav>
      <div className="login-box">
        <h2>Creat Account,</h2>
        <p style={{ fontSize: "15px", color: "white", marginBottom: "20px" }}>
          Welcome! Choose how you would like to get started.
        </p>
        <button className="google-button" onClick={handleSignUp}>
          <img src={googleLogo} alt="Google Logo" className="google-logo" />
          Sign-up for Google account
        </button>
        <p style={{ fontSize: "12px", color: "white", marginTop: "20px" }}>
          Already have a account?{" "}
          <a href={`${constPath.signIn}`} className="no-account">
            Sign-in
          </a>
        </p>
        <div className="divider"></div>
      </div>
    </div>
  );
};

export default SignUp;
