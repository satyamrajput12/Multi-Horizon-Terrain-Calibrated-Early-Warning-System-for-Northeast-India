import React from 'react';
import { ShieldAlert, Activity, Layers, Bell, BarChart2, Database, MapPin } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, alertCount, isFallbackActive }) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/20 p-2 rounded-lg border border-blue-500/30 text-blue-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wide">MHTC-EWS (NER)</h1>
              <span className="bg-blue-900/70 text-blue-300 text-xs px-2 py-0.5 rounded border border-blue-700 font-mono">
                70h Lead Time Target
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Multi-Horizon Terrain-Calibrated Early Warning System for Northeast India
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
              activeTab === 'map'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            GIS Risk Map
          </button>

          <button
            onClick={() => setActiveTab('ranking')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
              activeTab === 'ranking'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Spatial Prioritization
          </button>

          <button
            onClick={() => setActiveTab('benchmark')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
              activeTab === 'benchmark'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Model Benchmarks
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium relative transition ${
              activeTab === 'alerts'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            Early Warning Alerts
            {alertCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {alertCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('provenance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
              activeTab === 'provenance'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Data Sources & Bhuvan
          </button>
        </nav>
      </div>
    </header>
  );
}
