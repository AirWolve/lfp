// src/components/FileExport.jsx
import React, { useState } from "react";
import "../css/FileImport.css";
import HistoryContent from "./HistoryContent";

const FileExport = ({ userEmail }) => {
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);

  const handleExport = async () => {
    if (!selectedHistoryId || !userEmail) {
      alert("History를 선택하세요.");
      return;
    }
    const res = await fetch(`${process.env.REACT_APP_LFP_API_URL}/api/export-scenario`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ historyId: selectedHistoryId, userEmail }),
      credentials: "include"
    });
    const data = await res.json();
    if (data.downloadUrl) {
      window.location.href = `${process.env.REACT_APP_LFP_API_URL}${data.downloadUrl}`;
    } else {
      alert("Export 실패: " + (data.error || "Unknown error"));
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
