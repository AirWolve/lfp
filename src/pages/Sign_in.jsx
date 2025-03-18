import React from "react";
import './Sign-in.css';
import googleLogo from "../assets/google_icon.png"
import { useNavigate } from "react-router-dom";

const Sign_in = () => {
    const navigate = useNavigate();
    
    const handleNavigateBack = () => {
        navigate(-1);
    };
    
    const handleLogin = () => {
        window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?
		client_id=${process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID}
		&redirect_uri=${process.env.REACT_APP_GOOGLE_AUTH_REDIRECT_URI}
		&response_type=code
		&scope=email profile`;
    };

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
            <h2>Welcome aboard,</h2>
            <button className="google-button">
            <img src={googleLogo} alt="Google Logo" onClick={handleLogin} className="google-logo"/>
                Sign-in for Google account
            </button>
            <p style={{fontSize: "12px", color: "white"}}>You have no account? <a href="/Sign-up" className="no-account">Create account</a></p>
            <div className="divider"></div>
        </div>
    </div>
    );
};

export default Sign_in;