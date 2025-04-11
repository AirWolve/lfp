import React from "react";
import "./LoadingPage.css";

const LoadingPage = () => {
  return (
    <div className="loadingPage">
      <div className="loading-spinner"></div>
      <p className="loading-text">Loading...</p>
    </div>
  );
};

export default LoadingPage;
