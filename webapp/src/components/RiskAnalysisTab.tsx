import React, { useState, useMemo } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';

// Standardized approximate coefficients for a simplified Framingham model
const riskFactors = [
  { label: 'Age (per 10 yrs)', or: 2.1, ci: [1.8, 2.4] },
  { label: 'Male Sex', or: 1.8, ci: [1.5, 2.2] },
  { label: 'Smoker', or: 1.6, ci: [1.3, 2.0] },
  { label: 'Diabetes', or: 1.9, ci: [1.4, 2.5] },
  { label: 'Sys BP (per 20 mmHg)', or: 1.5, ci: [1.3, 1.8] },
  { label: 'Tot Chol (per 40 mg/dL)', or: 1.4, ci: [1.2, 1.7] }
];

export default function RiskAnalysisTab() {
  const [profile, setProfile] = useState({
    age: 50,
    male: 1,
    smoker: 0,
    diabetes: 0,
    sysBP: 120,
    totChol: 200
  });

  // Simplified risk calculation just for UI demonstration
  const calculateRisk = () => {
    let score = 0;
    score += (profile.age - 30) / 10 * Math.log(2.1);
    score += profile.male * Math.log(1.8);
    score += profile.smoker * Math.log(1.6);
    score += profile.diabetes * Math.log(1.9);
    score += (profile.sysBP - 120) / 20 * Math.log(1.5);
    score += (profile.totChol - 160) / 40 * Math.log(1.4);
    
    // Convert to probability using a baseline
    const baseRisk = 0.03;
    const risk = baseRisk * Math.exp(score);
    return Math.min(Math.max(risk * 100, 0), 100);
  };

  const riskPercent = calculateRisk();

  const orData = {
    labels: riskFactors.map(f => f.label),
    datasets: [{
      label: 'Odds Ratio',
      data: riskFactors.map(f => f.or),
      backgroundColor: '#B83232',
      barThickness: 16
    }]
  };

  const orOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `OR: ${ctx.raw} (95% CI: ${riskFactors[ctx.dataIndex].ci.join('-')})`
        }
      }
    },
    scales: {
      x: { title: { display: true, text: 'Odds Ratio (95% CI)' }, grid: { color: 'rgba(26,25,22,0.06)' } },
      y: { grid: { display: false }, ticks: { font: { family: '"DM Sans", sans-serif' } } }
    }
  };

  const gaugeData = {
    labels: ['Risk', 'Safe'],
    datasets: [{
      data: [riskPercent, 100 - riskPercent],
      backgroundColor: ['#B83232', '#EEECE7'],
      borderWidth: 0,
      circumference: 180,
      rotation: 270
    }]
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-surface rounded-lg p-6 border border-border-light shadow-sm">
        <h3 className="font-sans text-sm font-medium mb-4">Logistic Risk Factor Contributions (Odds Ratios)</h3>
        <div className="h-[250px]">
          <Bar data={orData} options={orOptions as any} />
        </div>
      </div>

      <div className="bg-surface rounded-lg p-6 border border-border-light shadow-sm flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <h3 className="font-sans text-sm font-medium mb-6">Interactive Patient Profile</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 font-sans text-sm">
            <div>
              <label className="block text-secondary text-xs mb-1 uppercase tracking-wider">Age</label>
              <input type="range" min="30" max="80" value={profile.age} onChange={e => setProfile({...profile, age: +e.target.value})} className="w-full accent-[#B83232]" />
              <div className="text-right font-mono text-primary">{profile.age} yrs</div>
            </div>
            <div>
              <label className="block text-secondary text-xs mb-1 uppercase tracking-wider">Sys BP</label>
              <input type="range" min="90" max="200" value={profile.sysBP} onChange={e => setProfile({...profile, sysBP: +e.target.value})} className="w-full accent-[#B83232]" />
              <div className="text-right font-mono text-primary">{profile.sysBP} mmHg</div>
            </div>
            <div>
              <label className="block text-secondary text-xs mb-1 uppercase tracking-wider">Total Chol</label>
              <input type="range" min="130" max="350" value={profile.totChol} onChange={e => setProfile({...profile, totChol: +e.target.value})} className="w-full accent-[#B83232]" />
              <div className="text-right font-mono text-primary">{profile.totChol} mg/dL</div>
            </div>
            
            <div className="col-span-2 grid grid-cols-3 gap-4 pt-4 border-t border-border-light">
               <div>
                  <label className="block text-secondary text-xs mb-2 uppercase tracking-wider">Sex</label>
                  <select value={profile.male} onChange={e => setProfile({...profile, male: +e.target.value})} className="w-full border border-border-strong rounded px-2 py-1 bg-surface">
                     <option value={1}>Male</option>
                     <option value={0}>Female</option>
                  </select>
               </div>
               <div>
                  <label className="block text-secondary text-xs mb-2 uppercase tracking-wider">Smoker</label>
                  <select value={profile.smoker} onChange={e => setProfile({...profile, smoker: +e.target.value})} className="w-full border border-border-strong rounded px-2 py-1 bg-surface">
                     <option value={1}>Yes</option>
                     <option value={0}>No</option>
                  </select>
               </div>
               <div>
                  <label className="block text-secondary text-xs mb-2 uppercase tracking-wider">Diabetes</label>
                  <select value={profile.diabetes} onChange={e => setProfile({...profile, diabetes: +e.target.value})} className="w-full border border-border-strong rounded px-2 py-1 bg-surface">
                     <option value={1}>Yes</option>
                     <option value={0}>No</option>
                  </select>
               </div>
            </div>
          </div>
        </div>

        <div className="w-[250px] shrink-0 flex flex-col items-center justify-center border-l border-border-light pl-8">
           <h4 className="font-sans text-sm text-secondary mb-2 text-center">Predicted 10-Year<br/>CHD Risk</h4>
           <div className="relative w-full aspect-square max-h-[150px]">
              <Doughnut data={gaugeData} options={{ maintainAspectRatio: false, plugins: { tooltip: { enabled: false }, legend: { display: false } }, cutout: '80%' }} />
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
                 <span className="font-mono text-3xl font-medium" style={{ color: riskPercent > 20 ? '#B83232' : '#1A1916' }}>
                    {riskPercent.toFixed(1)}%
                 </span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
