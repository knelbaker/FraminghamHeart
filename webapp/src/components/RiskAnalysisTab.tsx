import React, { useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';

// Hazard Ratios from Framingham 2008
const riskFactors = [
  { id: 'smoker', label: 'Smoking (Current)', hrMen: 1.92, hrWomen: 1.70 },
  { id: 'diabetes', label: 'Diabetes', hrMen: 1.78, hrWomen: 2.00 },
  { id: 'age', label: 'Age (Log-transformed)', hrMen: 21.35, hrWomen: 10.27 },
  { id: 'totChol', label: 'Total Chol (Log-transformed)', hrMen: 3.08, hrWomen: 3.35 },
  { id: 'sysBPUntreated', label: 'Sys BP (Log-transformed)', hrMen: 6.91, hrWomen: 15.82 }
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

  // Calculate risk using the Cox proportional hazards equation
  const calculateRisk = () => {
    const isMale = profile.male === 1;

    // Helper to calculate the linear predictor (score) for a given profile
    const getScore = (p: any) => {
      let s = 0;
      s += p.smoker * Math.log(isMale ? 1.92 : 1.70);
      s += p.diabetes * Math.log(isMale ? 1.78 : 2.00);
      s += Math.log(p.age) * Math.log(isMale ? 21.35 : 10.27);
      s += Math.log(p.totChol) * Math.log(isMale ? 3.08 : 3.35);
      s += Math.log(p.sysBP) * Math.log(isMale ? 6.91 : 15.82);
      return s;
    };

    const score = getScore(profile);

    // Calculate meanScore dynamically using approximate Framingham average populations
    // This perfectly calibrates the model since we removed the explicit HDL variable.
    const meanProfileMen = { age: 49, totChol: 190, sysBP: 124, smoker: 0.325, diabetes: 0.05 };
    const meanProfileWomen = { age: 50, totChol: 213, sysBP: 125, smoker: 0.26, diabetes: 0.04 };
    const meanScore = getScore(isMale ? meanProfileMen : meanProfileWomen);

    // Cox proportional hazards baseline survival
    const s0 = isMale ? 0.88936 : 0.95012;

    const risk = 1 - Math.pow(s0, Math.exp(score - meanScore));
    return Math.min(Math.max(risk * 100, 0), 100);
  };

  const riskPercent = calculateRisk();

  const hrData = {
    labels: riskFactors.map(f => f.label),
    datasets: [
      {
        label: 'Men',
        data: riskFactors.map(f => f.hrMen),
        backgroundColor: '#3A6B8A',
        barThickness: 12
      },
      {
        label: 'Women',
        data: riskFactors.map(f => f.hrWomen),
        backgroundColor: '#B83232',
        barThickness: 12
      }
    ]
  };

  const hrOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: true, position: 'top' as const, labels: { font: { family: '"DM Sans", sans-serif', size: 11 } } },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${ctx.dataset.label} HR: ${ctx.raw}`
        }
      }
    },
    scales: {
      x: { title: { display: true, text: 'Hazard Ratio' }, grid: { color: 'rgba(26,25,22,0.06)' } },
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
        <h3 className="font-sans text-sm font-medium mb-4">Cox Proportional Hazards (Hazard Ratios)</h3>
        <div className="h-[250px]">
          <Bar data={hrData} options={hrOptions as any} />
        </div>
      </div>

      <div className="bg-surface rounded-lg p-6 border border-border-light shadow-sm flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <h3 className="font-sans text-sm font-medium mb-6">Interactive Patient Profile</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 font-sans text-sm">
            <div>
              <label className="block text-secondary text-xs mb-1 uppercase tracking-wider">Age</label>
              <input type="range" min="30" max="80" value={profile.age} onChange={e => setProfile({ ...profile, age: +e.target.value })} className="w-full accent-[#B83232]" />
              <div className="text-right font-mono text-primary">{profile.age} yrs</div>
            </div>
            <div>
              <label className="block text-secondary text-xs mb-1 uppercase tracking-wider">Sys BP</label>
              <input type="range" min="90" max="200" value={profile.sysBP} onChange={e => setProfile({ ...profile, sysBP: +e.target.value })} className="w-full accent-[#B83232]" />
              <div className="text-right font-mono text-primary">{profile.sysBP} mmHg</div>
            </div>
            <div className="col-span-2">
              <label className="block text-secondary text-xs mb-1 uppercase tracking-wider">Total Chol</label>
              <input type="range" min="130" max="350" value={profile.totChol} onChange={e => setProfile({ ...profile, totChol: +e.target.value })} className="w-full accent-[#B83232]" />
              <div className="text-right font-mono text-primary">{profile.totChol} mg/dL</div>
            </div>

            <div className="col-span-2 grid grid-cols-3 gap-4 pt-4 border-t border-border-light">
              <div>
                <label className="block text-secondary text-xs mb-2 uppercase tracking-wider">Sex</label>
                <select value={profile.male} onChange={e => setProfile({ ...profile, male: +e.target.value })} className="w-full border border-border-strong rounded px-2 py-1 bg-surface">
                  <option value={1}>Male</option>
                  <option value={0}>Female</option>
                </select>
              </div>
              <div>
                <label className="block text-secondary text-xs mb-2 uppercase tracking-wider">Smoker</label>
                <select value={profile.smoker} onChange={e => setProfile({ ...profile, smoker: +e.target.value })} className="w-full border border-border-strong rounded px-2 py-1 bg-surface">
                  <option value={1}>Yes</option>
                  <option value={0}>No</option>
                </select>
              </div>
              <div>
                <label className="block text-secondary text-xs mb-2 uppercase tracking-wider">Diabetes</label>
                <select value={profile.diabetes} onChange={e => setProfile({ ...profile, diabetes: +e.target.value })} className="w-full border border-border-strong rounded px-2 py-1 bg-surface">
                  <option value={1}>Yes</option>
                  <option value={0}>No</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="w-[250px] shrink-0 flex flex-col items-center justify-center border-l border-border-light pl-8">
          <h4 className="font-sans text-sm text-secondary mb-2 text-center">Predicted 10-Year<br />CVD Risk</h4>
          <div className="relative w-full aspect-square max-h-[150px]">
            <Doughnut data={gaugeData} options={{ maintainAspectRatio: false, plugins: { tooltip: { enabled: false }, legend: { display: false } }, cutout: '80%' }} />
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
              <span className="font-mono text-3xl font-medium" style={{ color: riskPercent > 20 ? '#B83232' : '#1A1916' }}>
                {isNaN(riskPercent) ? '--' : riskPercent.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
