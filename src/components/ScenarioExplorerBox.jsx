import React, { useState } from 'react';
import MultiLineChart from './MultiLineChart';
import LineChart from './LineChart';

function ScenarioExplorerBox() {
  const [paramName, setParamName] = useState("retirement_age");
  const [min, setMin] = useState(60);
  const [max, setMax] = useState(70);
  const [step, setStep] = useState(2);
  const [results, setResults] = useState(null);

  const runExploration = async () => {
    const response = await fetch('/api/one_dimensional_explore', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ paramName, min, max, step })
    });
    const data = await response.json();
    setResults(data);
  };

  return (
    <div>
      <h3>One Dimensional Scenario Exploration</h3>
      <label>Parameter Name:
        <input value={paramName} onChange={e => setParamName(e.target.value)} />
      </label>
      <label>Min:
        <input type="number" value={min} onChange={e => setMin(+e.target.value)} />
      </label>
      <label>Max:
        <input type="number" value={max} onChange={e => setMax(+e.target.value)} />
      </label>
      <label>Step:
        <input type="number" value={step} onChange={e => setStep(+e.target.value)} />
      </label>
      <button onClick={runExploration}>Run Exploration</button>

      {results && (
        <>
          <MultiLineChart data={results} />
          <LineChart data={results} />
        </>
      )}
    </div>
  );
}

export default ScenarioExplorerBox;
