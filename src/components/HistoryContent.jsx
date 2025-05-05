import React, { useEffect, useState } from "react";
import styles from "../css/HistoryContent.module.css";

const HistoryContent = ({ userEmail }) => {
  const [history, setHistory] = useState([]);
  const [openScenario, setOpenScenario] = useState(null);

  useEffect(() => {
    if (!userEmail) return;
    fetch(`${process.env.REACT_APP_LFP_API_URL}/api/history?userEmail=${encodeURIComponent(userEmail)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.history) setHistory(data.history);
      });
  }, [userEmail]);

  // scenarioName별로 그룹화
  const grouped = history.reduce((acc, item) => {
    if (!acc[item.scenarioName]) acc[item.scenarioName] = [];
    acc[item.scenarioName].push(item);
    return acc;
  }, {});

  return (
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
                items.map((item, idx) => {
                  let avgChance = "-";
                  try {
                    const simResult = typeof item.simResult === "string" ? JSON.parse(item.simResult) : item.simResult;
                    avgChance = simResult.AvgChanceOfSuccess !== undefined ? simResult.AvgChanceOfSuccess : "-";
                  } catch (e) {}
                  return (
                    <div key={item._id} className={styles.panelItem}>
                      <div>index: {idx + 1}</div>
                      <div>createdAt: {new Date(item.createdAt).toLocaleString()}</div>
                      <div>AvgChanceOfSuccess: {avgChance}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default HistoryContent; 