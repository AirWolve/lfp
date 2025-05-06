import React, { useEffect, useState } from "react";
import styles from "../css/HistoryContent.module.css";

const HistoryContent = ({ userEmail, selectedHistoryId, onSelectHistory = () => {} }) => {
  const [history, setHistory] = useState([]);
  const [openScenario, setOpenScenario] = useState(null);

  useEffect(() => {
    if (!userEmail) return;
    // Fetch the history from the server
    fetch(`${process.env.REACT_APP_LFP_API_URL}/api/history?userEmail=${encodeURIComponent(userEmail)}`)
      .then((res) => res.json())
      .then((data) => {
        // Set the history
        if (data.history) setHistory(data.history);
      });
  }, [userEmail]);

  // Group the history by scenarioName
  const grouped = history.reduce((acc, item) => {
    if (!acc[item.scenarioName]) acc[item.scenarioName] = [];
    acc[item.scenarioName].push(item);
    return acc;
  }, {});

  return (
    // Show the history list
    <div style={{ color: "black" }}>
      {Object.keys(grouped).length === 0 ? (
        <p>No scenarios available.</p>
      ) : (
        Object.entries(grouped).map(([scenarioName, items]) => (
          <div key={scenarioName} className={styles.accordionItem}>
            <div
              className={styles.accordionHeader}
              onClick={() => setOpenScenario(openScenario === scenarioName ? null : scenarioName)}
            >
              {scenarioName}
            </div>
            <div
              className={styles.accordionPanel}
              style={{
                maxHeight: openScenario === scenarioName ? 500 : 0,
                padding: openScenario === scenarioName ? 8 : 0
              }}
            >
              {openScenario === scenarioName && (
                <table className={styles.historyTable}>
                  <thead>
                    <tr>
                      <th></th>
                      <th>Index</th>
                      <th>Created At</th>
                      <th>AvgChanceOfSuccess</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      let avgChance = "-";
                      try {
                        // Parse the simResult
                        const simResult = typeof item.simResult === "string" ? JSON.parse(item.simResult) : item.simResult;
                        avgChance = simResult.AvgChanceOfSuccess !== undefined ? simResult.AvgChanceOfSuccess : "-";
                      } catch (e) {}
                      // Check if the item is selected
                      const isSelected = selectedHistoryId === item._id;
                      return (
                        <tr
                          key={item._id}
                          className={isSelected ? styles.selectedRow : ""}
                          onClick={() => onSelectHistory(item._id)}
                          style={{ cursor: "pointer" }}
                        >
                          <td>
                            <input
                              type="radio"
                              checked={isSelected}
                              onChange={() => onSelectHistory(item._id)}
                              onClick={e => e.stopPropagation()}
                            />
                          </td>
                          <td>{idx + 1}</td>
                          <td>{new Date(item.createdAt).toLocaleString()}</td>
                          <td>{avgChance}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default HistoryContent; 