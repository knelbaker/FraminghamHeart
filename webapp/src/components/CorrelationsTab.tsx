import React, { useMemo, useState } from 'react';
import { Scatter } from 'react-chartjs-2';

const variables = ['age', 'cigsPerDay', 'totChol', 'sysBP', 'diaBP', 'BMI', 'heartRate', 'glucose'];

function getPearsonCorrelation(x: number[], y: number[]) {
  const n = x.length;
  if (n === 0) return 0;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
    sumY2 += y[i] * y[i];
  }
  const num = (n * sumXY) - (sumX * sumY);
  const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  if (den === 0) return 0;
  return num / den;
}

export default function CorrelationsTab({ data }: { data: any[] }) {
  const [scatterX, setScatterX] = useState('sysBP');
  const [scatterY, setScatterY] = useState('diaBP');

  const matrix = useMemo(() => {
    const mat: Record<string, Record<string, number>> = {};
    variables.forEach(v1 => {
      mat[v1] = {};
      variables.forEach(v2 => {
        if (v1 === v2) {
          mat[v1][v2] = 1;
        } else {
          const pairs = data.filter(d => 
            typeof d[v1] === 'number' && !isNaN(d[v1]) && 
            typeof d[v2] === 'number' && !isNaN(d[v2])
          );
          const r = getPearsonCorrelation(pairs.map(p => p[v1]), pairs.map(p => p[v2]));
          mat[v1][v2] = r;
        }
      });
    });
    return mat;
  }, [data]);

  const getColor = (r: number) => {
    // scale from -1 to 1: '#3A6B8A' (neg) -> '#FFFFFF' -> '#B83232' (pos)
    if (r > 0) {
      const alpha = Math.min(r * 1.5, 1); // boost visibility
      return `rgba(184, 50, 50, ${alpha})`;
    } else {
      const alpha = Math.min(Math.abs(r) * 1.5, 1);
      return `rgba(58, 107, 138, ${alpha})`;
    }
  };

  const scatterData = useMemo(() => {
    const pts = data.filter(d => d[scatterX] != null && d[scatterY] != null).map(d => ({
      x: d[scatterX],
      y: d[scatterY]
    }));
    return {
      datasets: [{
        label: `${scatterX} vs ${scatterY}`,
        data: pts,
        backgroundColor: 'rgba(26,25,22,0.4)',
        borderColor: 'rgba(26,25,22,0.1)',
        borderWidth: 1,
        pointRadius: 3
      }]
    };
  }, [data, scatterX, scatterY]);

  const scatterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { title: { display: true, text: scatterX, font: { family: '"DM Sans", sans-serif' } } },
      y: { title: { display: true, text: scatterY, font: { family: '"DM Sans", sans-serif' } } }
    },
    plugins: { legend: { display: false } }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-surface rounded-lg p-6 border border-border-light shadow-sm overflow-x-auto">
        <h3 className="font-sans text-sm font-medium mb-4">Correlation Matrix</h3>
        <div className="min-w-[600px]">
          <div className="grid" style={{ gridTemplateColumns: `100px repeat(${variables.length}, 1fr)` }}>
            <div></div>
            {variables.map(v => (
              <div key={v} className="text-center text-[10px] text-secondary font-mono rotate-[-45deg] origin-bottom-left h-16">{v}</div>
            ))}
            {variables.map(rowVar => (
              <React.Fragment key={rowVar}>
                <div className="text-[10px] text-secondary font-mono flex items-center justify-end pr-2 h-10">{rowVar}</div>
                {variables.map(colVar => {
                  const r = matrix[rowVar][colVar];
                  return (
                    <div 
                      key={`${rowVar}-${colVar}`}
                      className="h-10 border-[0.5px] border-white flex items-center justify-center cursor-pointer hover:border-black transition-colors group relative"
                      style={{ backgroundColor: getColor(r) }}
                      onClick={() => { setScatterX(colVar); setScatterY(rowVar); }}
                    >
                      <span className="opacity-0 group-hover:opacity-100 text-[10px] font-mono bg-white px-1 border border-border-light rounded z-10 absolute pointer-events-none shadow-sm">
                        {r.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-lg p-6 border border-border-light shadow-sm flex flex-col min-h-[350px]">
        <div className="flex gap-4 mb-4">
          <select value={scatterX} onChange={e => setScatterX(e.target.value)} className="border border-border-strong rounded px-2 py-1 text-sm bg-surface">
            {variables.map(v => <option key={v} value={v}>X: {v}</option>)}
          </select>
          <select value={scatterY} onChange={e => setScatterY(e.target.value)} className="border border-border-strong rounded px-2 py-1 text-sm bg-surface">
            {variables.map(v => <option key={v} value={v}>Y: {v}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <Scatter data={scatterData} options={scatterOptions as any} />
        </div>
      </div>
    </div>
  );
}
