import React, { useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';

const variables = [
  { id: 'age', label: 'Age (years)' },
  { id: 'cigsPerDay', label: 'Cigarettes Per Day' },
  { id: 'totChol', label: 'Total Cholesterol (mg/dL)' },
  { id: 'sysBP', label: 'Systolic Blood Pressure (mmHg)' },
  { id: 'diaBP', label: 'Diastolic Blood Pressure (mmHg)' },
  { id: 'BMI', label: 'Body Mass Index' },
  { id: 'heartRate', label: 'Heart Rate (beats/min)' },
  { id: 'glucose', label: 'Glucose (mg/dL)' },
];

export default function DistributionsTab({ data }: { data: any[] }) {
  const [selectedVar, setSelectedVar] = useState('sysBP');

  const { chartData, stats } = useMemo(() => {
    let validValues = data.map(d => d[selectedVar]).filter(v => v != null && !isNaN(v));
    validValues.sort((a, b) => a - b);
    
    if (validValues.length === 0) return { chartData: null, stats: null };

    // Stats
    const sum = validValues.reduce((a, b) => a + b, 0);
    const mean = sum / validValues.length;
    const mid = Math.floor(validValues.length / 2);
    const median = validValues.length % 2 !== 0 ? validValues[mid] : (validValues[mid - 1] + validValues[mid]) / 2;
    const sqDiffs = validValues.map(v => Math.pow(v - mean, 2));
    const variance = sqDiffs.reduce((a, b) => a + b, 0) / validValues.length;
    const stdDev = Math.sqrt(variance);
    const min = validValues[0];
    const max = validValues[validValues.length - 1];
    
    // Skewness approx
    const skewness = validValues.reduce((acc, v) => acc + Math.pow(v - mean, 3), 0) / (validValues.length * Math.pow(stdDev, 3));

    // Histogram
    const numBins = 20;
    const binWidth = (max - min) / numBins;
    const bins = new Array(numBins).fill(0);
    const labels = new Array(numBins).fill('');

    validValues.forEach(v => {
      let idx = Math.floor((v - min) / binWidth);
      if (idx === numBins) idx--;
      bins[idx]++;
    });

    for(let i=0; i<numBins; i++) {
      labels[i] = (min + i * binWidth).toFixed(1);
    }

    const chartData = {
      labels,
      datasets: [
        {
          type: 'line' as const,
          label: 'Density Estimate',
          data: bins.map(b => b), // Scale appropriately if true KDE
          borderColor: '#B83232',
          borderDash: [5, 5],
          tension: 0.4,
          pointRadius: 0,
          fill: false,
          yAxisID: 'y'
        },
        {
          type: 'bar' as const,
          label: 'Frequency',
          data: bins,
          backgroundColor: 'rgba(26,25,22,0.1)',
          borderColor: 'rgba(26,25,22,0.2)',
          borderWidth: 1,
          barPercentage: 1.0,
          categoryPercentage: 1.0,
          yAxisID: 'y'
        }
      ]
    };

    return { 
      chartData, 
      stats: { mean, median, stdDev, min, max, skewness } 
    };
  }, [data, selectedVar]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: '"DM Mono", monospace', size: 11 }, color: '#6B6861', maxTicksLimit: 10 }
      },
      y: {
        grid: { color: 'rgba(26,25,22,0.06)' },
        border: { display: false },
        ticks: { font: { family: '"DM Mono", monospace', size: 11 }, color: '#6B6861' }
      }
    },
    plugins: { legend: { display: false } }
  };

  return (
    <div className="flex gap-6 h-[400px]">
      <div className="flex-1 bg-surface border border-border-light rounded-lg p-6 shadow-sm flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-sans text-sm font-medium">Distribution Analysis</h3>
          <select 
            value={selectedVar} 
            onChange={e => setSelectedVar(e.target.value)}
            className="border border-border-strong rounded px-2 py-1 text-sm font-sans bg-surface text-primary"
          >
            {variables.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
          </select>
        </div>
        <div className="flex-1 min-h-0">
          {chartData && <Bar data={chartData} options={options} />}
        </div>
      </div>
      
      <div className="w-[240px] shrink-0 bg-surface border border-border-light rounded-lg p-6 shadow-sm flex flex-col">
        <h3 className="font-sans text-sm font-medium mb-6">Summary Statistics</h3>
        {stats && (
          <div className="space-y-4">
            {[
              { label: 'Mean', val: stats.mean.toFixed(2) },
              { label: 'Median', val: stats.median.toFixed(2) },
              { label: 'Std Dev', val: stats.stdDev.toFixed(2) },
              { label: 'Min', val: stats.min.toFixed(2) },
              { label: 'Max', val: stats.max.toFixed(2) },
              { label: 'Skewness', val: stats.skewness.toFixed(2) }
            ].map((s, i) => (
              <div key={i} className="flex justify-between border-b border-border-light pb-2 last:border-0">
                <span className="text-secondary font-sans text-sm">{s.label}</span>
                <span className="text-primary font-mono text-sm">{s.val}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
