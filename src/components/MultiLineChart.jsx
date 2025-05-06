import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

function MultiLineChart({ data }) {
  const lines = Object.keys(data).map(paramValue => ({
    param: paramValue,
    success: data[paramValue].success_probability
  }));

  return (
    <LineChart width={600} height={400}>
      <XAxis dataKey="year" />
      <YAxis />
      <Tooltip />
      <Legend />
      {lines.map((line, index) => (
        <Line
          key={index}
          dataKey={() => line.success}
          name={`Param ${line.param}`}
          type="monotone"
          stroke={`hsl(${index * 60}, 70%, 50%)`}
        />
      ))}
    </LineChart>
  );
}

export default MultiLineChart;
