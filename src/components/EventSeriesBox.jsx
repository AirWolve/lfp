import React from "react";
import editIcon from "../assets/editIcon.svg";
import { useNavigate } from "react-router-dom";
import { constPath } from "../config.js";

const EventSeriesBox = () => {
  const eventSeries = JSON.parse(localStorage.getItem("EventSeries")) ?? null;
  const navigate = useNavigate();
  console.log(eventSeries);

  const safeRender = (value) => {
    if (value === null || value === undefined) return 'N/A';
    try {
      return typeof value === 'object' ? JSON.stringify(value) : String(value);
    } catch (e) {
      console.error('Error rendering value:', e);
      return 'Error';
    }
  };

  const displayedItems = eventSeries?.slice(0, 2) ?? [];
  const hasMoreItems = eventSeries?.length > 3 ?? false;
  
  return (
    <div className="basic-info-box">
      <div className="basic-info-box-title">
        <h3>
          Event Series Information
          <button
            className="boxButton"
            onClick={() => navigate(constPath.eventSeries)}
          >
            <img className="editIcon" alt="edit" src={editIcon} />
          </button>
        </h3>
      </div>
      <div className="basic-info-box-content">
        {eventSeries && eventSeries.length > 0 ? (
          displayedItems.map((type, index) => (
            <div key={index}>
              <p>Name: {safeRender(type.name)}</p>
              <p>Type: {safeRender(type.type)}</p>
              <br />
            </div>
          ))
        ) : (
          <p>No data exists</p>
        )}
        {hasMoreItems && <p>...</p>}
      </div>
    </div>
  );
};

export default EventSeriesBox;
