"use client";

import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

import OverviewTab from './OverviewTab';
import DistributionsTab from './DistributionsTab';
import CorrelationsTab from './CorrelationsTab';
import RiskAnalysisTab from './RiskAnalysisTab';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

export default function DashboardClient({ initialData }: { initialData: any[] }) {
  const [activeTab, setActiveTab] = useState('Overview');
  
  // Filter States
  const [ageRange, setAgeRange] = useState([30, 80]);
  const [sex, setSex] = useState('All');
  const [smoker, setSmoker] = useState('All');
  
  // Derive filtered data
  const filteredData = useMemo(() => {
    return initialData.filter(d => {
      if (d.age < ageRange[0] || d.age > ageRange[1]) return false;
      if (sex !== 'All') {
        const isMale = sex === 'Male';
        if (d.male !== (isMale ? 1 : 0)) return false;
      }
      if (smoker !== 'All') {
        const isSmoker = smoker === 'Yes';
        if (d.currentSmoker !== (isSmoker ? 1 : 0)) return false;
      }
      return true;
    });
  }, [initialData, ageRange, sex, smoker]);

  // Metric computations
  const metrics = useMemo(() => {
    if (filteredData.length === 0) return { age: '0', chd: '0', sysBp: '0', chol: '0' };
    let ageSum = 0, chdSum = 0, sysBpSum = 0, cholSum = 0;
    let validAge = 0, validBp = 0, validChol = 0;
    
    filteredData.forEach(d => {
      if (typeof d.age === 'number' && !isNaN(d.age)) { ageSum += d.age; validAge++; }
      if (typeof d.TenYearCHD === 'number' && !isNaN(d.TenYearCHD)) { chdSum += d.TenYearCHD; }
      if (typeof d.sysBP === 'number' && !isNaN(d.sysBP)) { sysBpSum += d.sysBP; validBp++; }
      if (typeof d.totChol === 'number' && !isNaN(d.totChol)) { cholSum += d.totChol; validChol++; }
    });
    
    return {
      age: validAge ? (ageSum / validAge).toFixed(1) : '0',
      chd: ((chdSum / filteredData.length) * 100).toFixed(1),
      sysBp: validBp ? (sysBpSum / validBp).toFixed(1) : '0',
      chol: validChol ? (cholSum / validChol).toFixed(1) : '0'
    };
  }, [filteredData]);

  return (
    <div className="flex flex-col h-screen overflow-hidden text-primary">
      {/* MASTHEAD */}
      <header className="h-[72px] shrink-0 border-b border-border-strong flex items-center justify-between px-6 bg-surface">
        <div>
          <h1 className="font-serif text-[28px] tracking-[0.02em]">Framingham Heart Study</h1>
          <p className="font-mono text-xs text-secondary">
            Longitudinal cardiovascular cohort &middot; 4,240 participants &middot; 1948–present
          </p>
        </div>
        <div className="font-mono text-accent text-base">
          n = {filteredData.length.toLocaleString()}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* FILTER PANEL */}
        <aside className="w-[220px] shrink-0 bg-surface border-r border-border-light overflow-y-auto p-5 space-y-6">
          <div>
            <div className="text-label mb-3">Age Range</div>
            <div className="flex gap-2 items-center font-mono text-[11px]">
               <input type="number" value={ageRange[0]} onChange={e => setAgeRange([+e.target.value, ageRange[1]])} className="w-12 border border-border-light rounded px-1 bg-surface text-primary" />
               -
               <input type="number" value={ageRange[1]} onChange={e => setAgeRange([ageRange[0], +e.target.value])} className="w-12 border border-border-light rounded px-1 bg-surface text-primary" />
            </div>
          </div>
          
          <div className="border-t border-border-light pt-4">
            <div className="text-label mb-3">Sex</div>
            <select value={sex} onChange={e => setSex(e.target.value)} className="w-full text-sm border border-border-light rounded p-1 bg-surface text-primary font-sans">
              <option>All</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>

          <div className="border-t border-border-light pt-4">
            <div className="text-label mb-3">Smoker Status</div>
            <select value={smoker} onChange={e => setSmoker(e.target.value)} className="w-full text-sm border border-border-light rounded p-1 bg-surface text-primary font-sans">
              <option>All</option>
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>

          <button 
            onClick={() => { setAgeRange([30, 80]); setSex('All'); setSmoker('All'); }}
            className="text-accent text-xs font-sans mt-8 hover:underline"
          >
            Reset filters
          </button>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col overflow-hidden relative z-0 bg-base">
          {/* TAB BAR */}
          <nav className="flex px-8 border-b border-border-light shrink-0 bg-base">
            {['Overview', 'Distributions', 'Correlations', 'Risk Analysis'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-4 font-sans text-sm transition-colors ${
                  activeTab === tab 
                    ? 'border-b-2 border-accent text-primary font-medium' 
                    : 'text-secondary font-normal hover:text-primary'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 transition-opacity duration-150">
            {/* CHARTS REGION */}
            <div className="shrink-0 flex-grow">
              {activeTab === 'Overview' && <OverviewTab data={filteredData} />}
              {activeTab === 'Distributions' && <DistributionsTab data={filteredData} />}
              {activeTab === 'Correlations' && <CorrelationsTab data={filteredData} />}
              {activeTab === 'Risk Analysis' && <RiskAnalysisTab />}
            </div>

            {/* STATS STRIP */}
            <div className="grid grid-cols-4 gap-4 mt-8 shrink-0">
              {[
                { label: 'Mean Age', value: metrics.age },
                { label: '% with CHD', value: metrics.chd },
                { label: 'Mean Systolic BP', value: metrics.sysBp },
                { label: 'Mean Total Chol', value: metrics.chol }
              ].map((stat, i) => (
                <div key={i} className="bg-surface rounded-lg p-4 border border-border-light shadow-sm">
                  <div className="font-mono text-[11px] text-secondary mb-1 uppercase tracking-wider">{stat.label}</div>
                  <div className="font-mono text-2xl text-primary">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
