import React, { useState } from "react";
import "../css/FileImport.css";
import HistoryContent from "./HistoryContent";

/* 
    Export the selected scenario
    Use HistoryContent to show the history list
    Use handleExport to export the selected scenario
*/

const FileExport = ({ userEmail }) => {
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);

  const handleExport = async () => {
    if (!selectedHistoryId || !userEmail) {
      alert("Please select a history.");
      return;
    }
    // Send the selected historyId and userEmail to the server
    const res = await fetch(`${process.env.REACT_APP_LFP_API_URL}/api/export-scenario`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ historyId: selectedHistoryId, userEmail }),
      credentials: "include"
    });
    const data = await res.json();
    if (data.downloadUrl) {
      // Redirect to the download URL
      window.location.href = `${process.env.REACT_APP_LFP_API_URL}${data.downloadUrl}`;
    } else {
      alert("Failed to export: " + (data.error || "Unknown error"));
    }
  };

  return (
    <div>
      <HistoryContent
        userEmail={userEmail}
        selectedHistoryId={selectedHistoryId}
        onSelectHistory={setSelectedHistoryId}
      />
      <button className="export-btn" onClick={handleExport} disabled={!selectedHistoryId}>
        Export Selected Scenario
      </button>
    </div>
  );
};

export default FileExport;
