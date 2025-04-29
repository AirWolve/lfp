import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/Dashboard.css";
import { constPath } from "../config.js";
import { useNavigate } from "react-router";
import MenuLayout from "../components/MenuLayout.jsx";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // withCredentials: Set to true to ensure HTTP-Only cookies are sent along.
    axios
      .get(`${process.env.REACT_APP_LFP_API_URL}/api/userinfo`, {
        withCredentials: true,
      })
      .then((response) => {
        const userData = response.data
        console.log(userData);
        sessionStorage.setItem("userData", [userData.given_name, userData.picture]);
        setUser(response.data);
      })
      .catch((error) => {
        console.error("User info fetch error:", error);
        //navigate(`${constPath.signIn}`);
      });
  }, [navigate]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <MenuLayout>
      <div className="content">
        <h2>
          Good to see you again!
          <br />
          {user?.name}
        </h2>
        <div className="button-grid">
          <button className="plan-button">
            <a href={`${constPath.basicSetting}`}>Create New Plan</a>
          </button>
          <button className="plan-button">Import Plan</button>
          <button className="plan-button">Export Plan</button>
          <button className="plan-button">Existing Plans</button>
        </div>
      </div>
    </MenuLayout>
  );
};

export default Dashboard;
