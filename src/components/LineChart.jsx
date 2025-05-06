import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

function LineChartComponent({ data }) {
  const chartData = Object.keys(data).map(paramValue => ({
    param: +paramValue,
    finalInvestment: data[paramValue].median_investments.slice(-1)[0]
  }));

  return (
    <LineChart width={600} height={400} data={chartData}>
      <XAxis dataKey="param" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="finalInvestment" stroke="#8884d8" />
    </LineChart>
  );
}

export default LineChartComponent;
