import React from "react";
import editIcon from "../assets/editIcon.svg";
import { useNavigate } from "react-router-dom";
import { constPath } from "../config.js";

const EventSeriesBox = () => {
  const eventSeries = JSON.parse(localStorage.getItem("EventSeries"));
  const navigate = useNavigate();
  const displayedItems = eventSeries.slice(0, 2);
  const hasMoreItems = eventSeries.length > 3;

  return (
    <div className="basic-info-box">
      <div className="basic-info-box-title">
        <h3>Event Series Information<button
          className="boxButton"
          onClick={() => navigate(constPath.eventSeries)}
        >
          <img className="editIcon" alt="edit" src={editIcon} />
        </button></h3>
        
      </div>
      <div className="basic-info-box-content">
        {eventSeries ? (
          <>
        {displayedItems.map((type, index) => (
          <div key={index}>
            <p>Name: {type.name}</p>
            <p>Type: {type.type}</p>
            <br />
          </div>
        ))}
        </>
        ) : (
          <>
            <p> No data exists </p>
          </>
        )}
        {hasMoreItems && <p>...</p>}
      </div>
    </div>
  );
};

export default EventSeriesBox;
