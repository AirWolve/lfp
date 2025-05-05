import React, { useEffect, useState } from "react";

const HistoryContent = ({ userEmail }) => {
  const [history, setHistory] = useState([]);
  const [openScenario, setOpenScenario] = useState(null);

  useEffect(() => {
    if (!userEmail) return;
    fetch(`/api/history?userEmail=${encodeURIComponent(userEmail)}`)
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
          <div key={scenarioName} style={{ marginBottom: 12, border: "1px solid #ccc", borderRadius: 6 }}>
            <div
              style={{ cursor: "pointer", padding: 8, background: "#f5f5f5", fontWeight: "bold" }}
              onClick={() => setOpenScenario(openScenario === scenarioName ? null : scenarioName)}
            >
              {scenarioName}
            </div>
            {openScenario === scenarioName && (
              <div style={{ padding: 8, background: "#fff" }}>
                {items.map((item, idx) => {
                  let avgChance = "-";
                  try {
                    const simResult = typeof item.simResult === "string" ? JSON.parse(item.simResult) : item.simResult;
                    avgChance = simResult.AvgChanceOfSuccess !== undefined ? simResult.AvgChanceOfSuccess : "-";
                  } catch (e) {}
                  return (
                    <div key={item._id} style={{ borderBottom: "1px solid #eee", padding: "6px 0" }}>
                      <div>index: {idx + 1}</div>
                      <div>createdAt: {new Date(item.createdAt).toLocaleString()}</div>
                      <div>AvgChanceOfSuccess: {avgChance}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default HistoryContent; 