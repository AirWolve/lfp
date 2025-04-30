import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/Dashboard.css";
import { constPath } from "../config.js";
import { useNavigate } from "react-router";
import MenuLayout from "../components/MenuLayout.jsx";
import FileImport from "../components/FileImport.jsx";
import FileExport from "../components/FileExport.jsx";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("import");

  useEffect(() => {
    // withCredentials: Set to true to ensure HTTP-Only cookies are sent along.
    axios
      .get(`${process.env.REACT_APP_LFP_API_URL}/api/userinfo`, {
        withCredentials: true,
      })
      .then((response) => {
        const userData = response.data;
        sessionStorage.setItem("userName", userData.given_name);
        sessionStorage.setItem("userImg", userData.picture);
        setUser(response.data);
      })
      .catch((error) => {
        console.error("User info fetch error:", error);
        //navigate(`${constPath.signIn}`);
      });
  }, [navigate]);

  // if (!user) {
  //   return <div>Loading...</div>;
  // }

  return (
    <MenuLayout>
      <div className="content">
        <h2>
          Good to see you again!
          <br />
          {user?.name}
        </h2>
        <div className="button-grid">
          <a href={`${constPath.basicSetting}`}>
            <button className="plan-button">Create New Plan</button>
          </a>
          <button
            className="plan-button"
            onClick={() => {
              setActiveTab("import");
              setShowModal(true);
            }}
          >
            Import/Export Plan
          </button>
          <button className="plan-button">Existing Plans</button>
          {showModal && (
            <div
              className="modalPopup"
              onMouseDown={() => setShowModal}
            >
              <div
                className="modalContent"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="tabHeader">
                  <button
                    className={activeTab === "import" ? "active" : ""}
                    onClick={() => {
                      setActiveTab("import");
                    }}
                  >
                    Import
                  </button>
                  <button
                    className={activeTab === "export" ? "active" : ""}
                    onClick={() => {
                      setActiveTab("export");
                    }}
                  >
                    Export
                  </button>
                  <button
                    className="closeButton"
                    onClick={() => setShowModal(false)}
                  >
                    
                    X
                  </button>
                  <div className="tabContent">
                    {activeTab === "import" ? (
                      <FileImport />
                    ) : (
                      <FileExport exportData={{
                        message: "Exported data from the app",
                        timestamp: new Date().toISOString(),
                        item: [1, 2, 3]
                      }} fileName="my_plan.json" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MenuLayout>
  );
};

export default Dashboard;
