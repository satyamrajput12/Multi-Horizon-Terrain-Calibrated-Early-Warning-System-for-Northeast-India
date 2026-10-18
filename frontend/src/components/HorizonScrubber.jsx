import React from 'react';
import { Clock, TrendingUp } from 'lucide-react';

const HORIZONS = [
  { key: '6h', label: '+6 Hours', role: 'Nowcast / Cloudburst & Debris Flow', tag: 'Immediate' },
  { key: '12h', label: '+12 Hours', role: 'Short-Range Tactical Response', tag: 'Tactical' },
  { key: '24h', label: '+24 Hours', role: 'Standard Operational District Advisory (DDMA)', tag: 'Operational' },
  { key: '48h', label: '+48 Hours', role: 'Medium-Range Slope Infiltration Horizon', tag: 'Medium-Range' },
  { key: '70h', label: '+70 Hours', role: 'Extended Synoptic Warning (Research Target)', tag: 'Research Target' }
];

export default function HorizonScrubber({ activeHorizon, onSelectHorizon, riskData }) {
  const currentH = HORIZONS.find((h) => h.key === activeHorizon) || HORIZONS[2];
  const horizonScores = riskData?.horizons || {};

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Multi-Horizon Forecast Lead Time Selector
          </h3>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span className="font-mono text-blue-400 font-semibold">{currentH.label}:</span>
          <span>{currentH.role}</span>
        </div>
      </div>

      {/* Horizon Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {HORIZONS.map((h) => {
          const isActive = activeHorizon === h.key;
          const scoreInfo = horizonScores[h.key];
          const scoreVal = scoreInfo?.terrain_aware_risk_score;
          const colorCode = scoreInfo?.color_code || '#64748b';

          return (
            <button
              key={h.key}
              onClick={() => onSelectHorizon(h.key)}
              className={`relative text-left p-2.5 rounded-lg border transition flex flex-col justify-between ${
                isActive
                  ? 'bg-blue-950/80 border-blue-500 shadow-md ring-1 ring-blue-400/50'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className={`text-xs font-bold ${isActive ? 'text-blue-300' : 'text-slate-300'}`}>
                  {h.label}
                </span>
                <span
                  className="w-2.5 h-2.5 rounded-full border border-white/50"
                  style={{ backgroundColor: colorCode }}
                  title={`Risk Level: ${scoreInfo?.risk_category || 'Evaluating'}`}
                />
              </div>

              <div className="text-[10px] text-slate-400 truncate mb-1">
                {h.tag}
              </div>

              {scoreVal !== undefined ? (
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400 text-[10px]">Score:</span>
                  <span className="font-mono font-bold" style={{ color: colorCode }}>
                    {scoreVal}
                  </span>
                </div>
              ) : (
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                  Select location
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
