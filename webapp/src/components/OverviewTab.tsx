import React, { useMemo } from 'react';
import { Bar, Line, Scatter } from 'react-chartjs-2';

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 300 },
  scales: {
    x: {
      grid: { display: false },
      border: { display: true, color: 'rgba(26,25,22,0.25)' },
      ticks: { font: { family: '"DM Mono", monospace', size: 11 }, color: '#6B6861' }
    },
    y: {
      grid: { color: 'rgba(26,25,22,0.06)' },
      border: { display: false },
      ticks: { font: { family: '"DM Mono", monospace', size: 11 }, color: '#6B6861' }
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#FFFFFF',
      titleColor: '#6B6861',
      bodyColor: '#1A1916',
      bodyFont: { family: '"DM Mono", monospace' },
      titleFont: { family: '"DM Sans", sans-serif' },
      borderColor: 'rgba(26,25,22,0.25)',
      borderWidth: 0.5,
      padding: 10,
    }
  }
};

export default function OverviewTab({ data }: { data: any[] }) {
  // 1. CHD by Age
  const chdByAgeData = useMemo(() => {
    const bins: Record<string, [number, number]> = { '30-39': [0,0], '40-49': [0,0], '50-59': [0,0], '60+': [0,0] };
    data.forEach(d => {
      let bin = '';
      if (d.age < 40) bin = '30-39';
      else if (d.age < 50) bin = '40-49';
      else if (d.age < 60) bin = '50-59';
      else bin = '60+';
      
      bins[bin][0]++; 
      if (d.TenYearCHD) bins[bin][1]++; 
    });
    
    return {
      labels: Object.keys(bins),
      datasets: [{
        label: '% with CHD',
        data: Object.values(bins).map(v => v[0] ? (v[1]/v[0]*100) : 0),
        backgroundColor: '#B83232'
      }]
    };
  }, [data]);

  // 2. SysBP dist by sex
  const sysBpDistData = useMemo(() => {
    // bins from 90 to 220, width 10
    const binsM = new Array(15).fill(0);
    const binsF = new Array(15).fill(0);
    const labels = Array.from({length: 15}, (_, i) => 90 + i * 10);
    
    data.forEach(d => {
      if (!d.sysBP) return;
      const idx = Math.min(Math.max(Math.floor((d.sysBP - 90) / 10), 0), 14);
      if (d.male === 1) binsM[idx]++;
      else binsF[idx]++;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Male',
          data: binsM,
          fill: true,
          backgroundColor: 'rgba(184, 50, 50, 0.4)', // --accent
          borderColor: '#B83232',
          tension: 0.4,
          pointRadius: 0
        },
        {
          label: 'Female',
          data: binsF,
          fill: true,
          backgroundColor: 'rgba(58, 107, 138, 0.4)', // slate blue
          borderColor: '#3A6B8A',
          tension: 0.4,
          pointRadius: 0
        }
      ]
    };
  }, [data]);

  // 3. Smoking status breakdown
  const smokingData = useMemo(() => {
    let smokers = 0, nonSmokers = 0;
    data.forEach(d => {
      if (d.currentSmoker === 1) smokers++;
      else if (d.currentSmoker === 0) nonSmokers++;
    });

    return {
      labels: ['Non-Smokers', 'Smokers'],
      datasets: [{
        label: 'Count',
        data: [nonSmokers, smokers],
        backgroundColor: ['#A8A59E', '#B83232'],
        indexAxis: 'y' as const
      }]
    };
  }, [data]);

  const hBarOptions = {
    ...chartOptions,
    indexAxis: 'y' as const,
    scales: {
      x: { ...chartOptions.scales.y, display: true },
      y: { ...chartOptions.scales.x, display: true, grid: { display: false } }
    }
  };

  // 4. BMI vs TenYearCHD
  const bmiScatterData = useMemo(() => {
    const malePoints: any[] = [];
    const femalePoints: any[] = [];

    data.forEach(d => {
      if (!d.BMI || d.TenYearCHD == null) return;
      // Add slight jitter to Y for visualization
      const jitter = (Math.random() - 0.5) * 0.1;
      const pt = { x: d.BMI, y: d.TenYearCHD + jitter, raw: d };
      if (d.male === 1) malePoints.push(pt);
      else femalePoints.push(pt);
    });

    return {
      datasets: [
        {
          label: 'Male',
          data: malePoints,
          backgroundColor: 'rgba(184, 50, 50, 0.6)',
          borderColor: '#FFFFFF',
          borderWidth: 1,
          pointRadius: 4,
        },
        {
          label: 'Female',
          data: femalePoints,
          backgroundColor: 'rgba(58, 107, 138, 0.6)',
          borderColor: '#FFFFFF',
          borderWidth: 1,
          pointRadius: 4,
        }
      ]
    };
  }, [data]);

  const scatterOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        min: -0.2,
        max: 1.2,
        ticks: {
          callback: (val: any) => val === 0 ? 'No CHD' : val === 1 ? 'CHD' : '',
          font: { family: '"DM Mono", monospace', size: 11 },
          color: '#6B6861'
        }
      }
    },
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        ...chartOptions.plugins.tooltip,
        callbacks: {
          label: (ctx: any) => `BMI: ${ctx.raw.x.toFixed(1)}`
        }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
      <div className="bg-surface rounded-lg p-5 border border-border-light shadow-sm">
        <h3 className="font-sans text-sm font-medium mb-4">CHD Prevalence by Age Group (%)</h3>
        <div className="h-[250px]"><Bar data={chdByAgeData} options={chartOptions} /></div>
      </div>
      
      <div className="bg-surface rounded-lg p-5 border border-border-light shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-sans text-sm font-medium">Systolic BP Distribution</h3>
          <div className="flex gap-3 text-[11px] font-sans">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#B83232] inline-block"></span>Male</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#3A6B8A] inline-block"></span>Female</span>
          </div>
        </div>
        <div className="h-[250px]"><Line data={sysBpDistData} options={chartOptions} /></div>
      </div>
      
      <div className="bg-surface rounded-lg p-5 border border-border-light shadow-sm">
        <h3 className="font-sans text-sm font-medium mb-4">Smoking Status</h3>
        <div className="h-[250px]"><Bar data={smokingData} options={hBarOptions as any} /></div>
      </div>
      
      <div className="bg-surface rounded-lg p-5 border border-border-light shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-sans text-sm font-medium">BMI vs CHD Risk</h3>
          <div className="flex gap-3 text-[11px] font-sans">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#B83232] inline-block opacity-60 rounded-full border border-white"></span>Male</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#3A6B8A] inline-block opacity-60 rounded-full border border-white"></span>Female</span>
          </div>
        </div>
        <div className="h-[250px]"><Scatter data={bmiScatterData} options={scatterOptions as any} /></div>
      </div>
    </div>
  );
}
