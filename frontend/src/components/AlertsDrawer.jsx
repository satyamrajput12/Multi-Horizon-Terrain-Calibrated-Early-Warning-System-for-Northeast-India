import React, { useState } from 'react';
import { Bell, AlertTriangle, ShieldAlert, CheckCircle, ExternalLink, Clock, ChevronRight } from 'lucide-react';

export default function AlertsDrawer({ alerts, onSelectLocation }) {
  const [filterLead, setFilterLead] = useState('ALL');

  const filteredAlerts = (alerts || []).filter((al) => {
    if (filterLead !== 'ALL' && `${al.lead_hours}h` !== filterLead) return false;
    return true;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-400" />
            <h2 className="text-base font-bold text-white">
              Experimental Early Warning Advisory Console
            </h2>
            <span className="bg-red-950 text-red-400 text-xs px-2 py-0.5 rounded border border-red-800 font-mono">
              {filteredAlerts.length} Active Protocols
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Standard Operating Procedures (SOP) aligned with NDMA Landslide Management Guidelines
          </p>
        </div>

        {/* Lead Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Filter Lead Time:</span>
          <select
            value={filterLead}
            onChange={(e) => setFilterLead(e.target.value)}
            className="bg-slate-950 text-slate-200 border border-slate-800 rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">All Horizons</option>
            <option value="6h">+6h (Nowcast)</option>
            <option value="12h">+12h (Tactical)</option>
            <option value="24h">+24h (Operational)</option>
            <option value="48h">+48h (Infiltration)</option>
            <option value="70h">+70h (Synoptic Target)</option>
          </select>
        </div>
      </div>

      {/* Experimental Disclaimer Banner */}
      <div className="bg-amber-950/40 border border-amber-800/60 p-3 rounded-lg text-xs text-amber-200 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-300">STRICT PROTOCOL DISCLAIMER:</strong> These advisories are generated automatically by the research forecasting prototype for experimental evaluation. They do not constitute official administrative emergency declarations. Always defer to official bulletins issued by the India Meteorological Department (IMD) and Geological Survey of India (GSI).
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-slate-950 p-8 text-center rounded-xl border border-slate-800 text-slate-400 text-xs">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="font-semibold text-slate-300">No active early-warning thresholds breached for this horizon filter.</p>
            <p className="text-slate-500 mt-1">All monitored arterial corridors are currently within normal baseline tolerances.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isHigh = alert.risk_score >= 0.75 || alert.risk_category.includes('Severe');
            const cardBorder = isHigh ? 'border-red-600/70' : 'border-amber-600/60';
            const badgeBg = isHigh ? 'bg-red-950 text-red-300 border-red-700' : 'bg-amber-950 text-amber-300 border-amber-700';

            return (
              <div
                key={alert.alert_id}
                className={`bg-slate-950 p-4 rounded-xl border ${cardBorder} shadow-md flex flex-col gap-3 transition hover:border-blue-500/60`}
              >
                {/* Top Info */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${badgeBg}`}>
                        {alert.alert_code} Alert &bull; {alert.forecast_horizon}
                      </span>
                      <h3 className="text-sm font-bold text-white">{alert.location_name}</h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Corridor: <strong className="text-slate-300">{alert.critical_corridor}</strong> ({alert.district}, {alert.state})
                    </p>
                  </div>

                  <div className="text-right text-xs">
                    <div className="text-[10px] text-slate-400">Valid Time</div>
                    <div className="font-mono text-slate-300 text-[11px]">{alert.valid_time}</div>
                  </div>
                </div>

                {/* Contributing Factors & Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400">Rainfall Forecast:</span>
                    <div className="font-bold text-cyan-400">{alert.contributing_factors.accumulated_rainfall}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Soil Saturation (API):</span>
                    <div className="font-bold text-cyan-400">{alert.contributing_factors.antecedent_saturation_72h}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Slope / Terrain Threat:</span>
                    <div className="font-bold text-amber-400">{alert.contributing_factors.slope_steepness}</div>
                  </div>
                </div>

                {/* Precautionary Action SOP */}
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 text-xs">
                  <div className="font-bold text-blue-300 mb-1 flex items-center gap-1.5 text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    {alert.recommended_precautionary_action.protocol_level}
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                    {alert.recommended_precautionary_action.action_items.map((act, i) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                  <div className="text-[10px] text-slate-500 mt-2 italic">
                    {alert.recommended_precautionary_action.guideline_standard}
                  </div>
                </div>

                {/* Links to Official Authorities */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">Official Warning Links:</span>
                    {alert.official_warning_links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline flex items-center gap-1 text-[10px]"
                      >
                        {link.authority.split(' - ')[0]}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ))}
                  </div>

                  <button
                    onClick={() => onSelectLocation({ id: alert.location_id, latitude: alert.coordinates.latitude, longitude: alert.coordinates.longitude, name: alert.location_name })}
                    className="flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded transition"
                  >
                    View on GIS Map
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
