import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { BarChart3, CloudRain, Droplet } from 'lucide-react';

export default function ForecastCharts({ weatherTimeline, riskData, selectedLocation }) {
  const [activeChartTab, setActiveChartTab] = useState('rain');

  if (!weatherTimeline || weatherTimeline.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-400">
        <CloudRain className="w-8 h-8 mx-auto mb-2 text-slate-600 animate-pulse" />
        <p className="text-sm">Loading 70-hour meteorological forecast timeline...</p>
      </div>
    );
  }

  // Format data for 70-hour timeline chart
  const timelineData = weatherTimeline.map((item) => ({
    hour: `+${item.horizon_hour}h`,
    hourNum: item.horizon_hour,
    precip: item.precipitation_mm,
    cumulative: item.cumulative_mm,
    soilMoisture: item.soil_moisture ? Math.round(item.soil_moisture * 100) : 35
  }));

  // Format multi-horizon comparison data
  const horizonsData = Object.entries(riskData?.horizons || {}).map(([key, h]) => ({
    name: `+${h.lead_time_hours}h`,
    rain: h.accumulated_rainfall_mm,
    riskScore: Math.round(h.terrain_aware_risk_score * 100),
    mlProb: Math.round(h.ml_probability * 100),
    color: h.color_code
  }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
      {/* Chart Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            70-Hour Forecast Evolution & Saturation Dynamics
          </h3>
          <p className="text-xs text-slate-400">
            {selectedLocation ? selectedLocation.name : 'NER Pilot Corridor'} &bull; Continuous hourly numerical weather prediction
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveChartTab('rain')}
            className={`px-2.5 py-1 rounded transition ${
              activeChartTab === 'rain' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Precipitation (70h)
          </button>
          <button
            onClick={() => setActiveChartTab('soil')}
            className={`px-2.5 py-1 rounded transition ${
              activeChartTab === 'soil' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Soil Moisture %
          </button>
          <button
            onClick={() => setActiveChartTab('horizons')}
            className={`px-2.5 py-1 rounded transition ${
              activeChartTab === 'horizons' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Multi-Horizon Risk
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full">
        {activeChartTab === 'rain' && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 10 }} interval={5} />
              <YAxis yAxisId="left" stroke="#3b82f6" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#06b6d4" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar yAxisId="left" dataKey="precip" name="Hourly Rain (mm)" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="cumulative" name="Cumulative Rain (mm)" stroke="#06b6d4" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {activeChartTab === 'soil' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 10 }} interval={5} />
              <YAxis domain={[0, 100]} stroke="#06b6d4" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area type="monotone" dataKey="soilMoisture" name="Pore Soil Saturation (%)" stroke="#06b6d4" fillOpacity={1} fill="url(#soilGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeChartTab === 'horizons' && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={horizonsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="rain" stroke="#3b82f6" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="risk" orientation="right" domain={[0, 100]} stroke="#f97316" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar yAxisId="rain" dataKey="rain" name="Forecast Rain Acc (mm)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Line yAxisId="risk" type="monotone" dataKey="riskScore" name="Terrain Risk Score (0-100)" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} />
              <Line yAxisId="risk" type="monotone" dataKey="mlProb" name="ML Probability %" stroke="#ec4899" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
        <span className="flex items-center gap-1.5">
          <CloudRain className="w-3.5 h-3.5 text-blue-400" />
          70h Lead Horizon Target: Tracking deep infiltration saturation vs sudden cloudburst triggers
        </span>
        <span className="font-mono text-slate-500">Step: 1h &bull; Total: 70 Hours</span>
      </div>
    </div>
  );
}
