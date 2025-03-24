import React from "react";
import { useNavigate } from "react-router-dom";
import { constPath } from '../config.js';
import "./Profile.css";
import profileImg from "../assets/profile.png";
import backIcon from "../assets/backArrow.svg";

const Profile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('https://lfp-api.simpo.pro/api/userinfo', { withCredentials: true })
      .then((response) => {
        setUserInfo(response.data);
      })
      .catch((error) => {
        console.error("Error fetching user info:", error);
        navigate(`${constPath.signIn}`);
      });
  }, [navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div>
      <div className="topbar" style={{backgroundColor: "#f0f0f0", justifyContent: "start"}}>
        <button className="backButton" onClick={handleBack}>
          <img src={backIcon} alt="back" className="backIcon" />
        </button>
      </div>

      <div className="profilePage">
        <div className="userInfo">
          <div className="imageWrap">
            <img src={userInfo?.picture || profileImg} alt="userImage" style={{ width: "60px", height: "60px" }} />
          </div>
          <p style={{ fontSize: "15px" }}>{ userInfo?.email || "Someone@gmail.com" }</p>
          <p style={{ fontSize: "13px", marginTop: "5px" }}>Last access time: {new Date().toLocaleTimeString()}</p>
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
