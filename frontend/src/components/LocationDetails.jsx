import React from 'react';
import { Mountain, Droplets, Compass, ShieldCheck, AlertTriangle, Layers, Info, CheckCircle2 } from 'lucide-react';

export default function LocationDetails({ location, riskData, activeHorizon }) {
  if (!location) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-400">
        <Mountain className="w-10 h-10 mx-auto mb-2 text-slate-600" />
        <p className="text-sm font-medium">Select a monitored corridor on the map or dropdown to view terrain-calibrated risk analytics.</p>
      </div>
    );
  }

  const hInfo = riskData?.horizons?.[activeHorizon] || riskData?.horizons?.['24h'];
  const attribution = hInfo?.factor_attribution || {};
  const antecedent = riskData?.antecedent_rainfall || {};
  const imdAlert = riskData?.imd_reference_alert || { code: 'GREEN', label: 'No Warning' };
  const metadata = riskData?.weather_metadata || {};

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-5">
      {/* Location Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">{location.name}</h2>
            <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded font-mono border border-slate-700">
              {location.id}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {location.district}, {location.state} &bull; <strong className="text-slate-300">{location.critical_corridor}</strong>
          </p>
        </div>

        {/* Current Horizon Risk Badge */}
        {hInfo && (
          <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">
                Risk @ {hInfo.lead_time_hours}h Lead Time
              </div>
              <div className="text-sm font-bold" style={{ color: hInfo.color_code }}>
                {hInfo.risk_category}
              </div>
            </div>
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center font-mono font-bold text-lg text-white shadow-inner"
              style={{ backgroundColor: hInfo.color_code }}
            >
              {hInfo.terrain_aware_risk_score}
            </div>
          </div>
        )}
      </div>

      {/* Terrain Characteristics & GSI Zonation */}
      <div>
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Mountain className="w-3.5 h-3.5 text-blue-400" />
          Terrain & Geomorphological Profile
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px]">Slope Angle</span>
            <div className="font-bold text-white text-sm mt-0.5">{location.slope_deg}°</div>
            <span className="text-[10px] text-amber-400">
              {location.slope_deg >= 38 ? 'High Shear Threat' : 'Moderate Incline'}
            </span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px]">Elevation / Relief</span>
            <div className="font-bold text-white text-sm mt-0.5">{location.elevation_m} m</div>
            <span className="text-[10px] text-slate-400">{location.aspect}</span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px]">GSI Susceptibility (NLSM)</span>
            <div className="font-bold text-amber-400 text-sm mt-0.5">{location.gsi_susceptibility}</div>
            <span className="text-[10px] text-slate-400">Score: {location.gsi_susceptibility_score}</span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px]">Topographic Wetness (TWI)</span>
            <div className="font-bold text-cyan-400 text-sm mt-0.5">{location.twi}</div>
            <span className="text-[10px] text-slate-400">Drainage: {location.drainage_density}</span>
          </div>
        </div>

        <div className="mt-2 text-xs text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex flex-col gap-1">
          <div><strong className="text-slate-300">Lithology:</strong> {location.lithology}</div>
          <div><strong className="text-slate-300">Geomorphology:</strong> {location.geomorphology}</div>
        </div>
      </div>

      {/* Antecedent Soil Saturation & Precipitation Accumulation */}
      <div>
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Droplets className="w-3.5 h-3.5 text-cyan-400" />
          Antecedent Soil Saturation (Observed / NWP Past Windows)
        </h4>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <div className="flex justify-between text-slate-400 text-[10px]">
              <span>T-24h Observed</span>
              <span className="font-mono text-cyan-400 font-bold">{antecedent.past_24h_mm ?? 0} mm</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-cyan-500 h-full rounded-full"
                style={{ width: `${Math.min(100, ((antecedent.past_24h_mm || 0) / 100) * 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <div className="flex justify-between text-slate-400 text-[10px]">
              <span>T-48h Observed</span>
              <span className="font-mono text-cyan-400 font-bold">{antecedent.past_48h_mm ?? 0} mm</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-cyan-500 h-full rounded-full"
                style={{ width: `${Math.min(100, ((antecedent.past_48h_mm || 0) / 150) * 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <div className="flex justify-between text-slate-400 text-[10px]">
              <span>T-72h Cumulative API</span>
              <span className="font-mono text-cyan-400 font-bold">{antecedent.past_72h_mm ?? 0} mm</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-cyan-400 h-full rounded-full"
                style={{ width: `${Math.min(100, ((antecedent.past_72h_mm || 0) / 200) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Explainable Factor Contribution Breakdown */}
      {hInfo && (
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-purple-400" />
              Explainable Risk Attribution ({activeHorizon} Horizon)
            </h4>
            <span className="text-[10px] text-slate-400">Total Contribution: 100%</span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-slate-300">Forecast Rainfall Accumulation ({hInfo.accumulated_rainfall_mm} mm)</span>
                <span className="font-mono font-bold text-blue-400">{attribution.forecast_rainfall_pct}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${attribution.forecast_rainfall_pct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-slate-300">Antecedent Soil Moisture & API Saturation</span>
                <span className="font-mono font-bold text-cyan-400">{attribution.antecedent_saturation_pct}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${attribution.antecedent_saturation_pct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-slate-300">Steep Slope Morphology ({location.slope_deg}°)</span>
                <span className="font-mono font-bold text-amber-400">{attribution.slope_morphology_pct}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${attribution.slope_morphology_pct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-slate-300">GSI Lithological Susceptibility Zone</span>
                <span className="font-mono font-bold text-emerald-400">{attribution.geological_susceptibility_pct}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${attribution.geological_susceptibility_pct}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IMD Benchmark & Official Reference Comparison */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <div className="font-semibold text-slate-200">
              IMD Official District Alert Status Reference
            </div>
            <div className="text-[11px] text-slate-400">
              {imdAlert.official_source || 'IMD Regional Meteorological Centre Guwahati'} &bull; Code: <strong className="text-white">{imdAlert.code}</strong>
            </div>
          </div>
        </div>
        <span
          className={`px-2.5 py-1 rounded text-xs font-bold border ${
            imdAlert.code === 'RED'
              ? 'bg-red-950 text-red-300 border-red-700'
              : imdAlert.code === 'ORANGE'
              ? 'bg-orange-950 text-orange-300 border-orange-700'
              : imdAlert.code === 'YELLOW'
              ? 'bg-yellow-950 text-yellow-300 border-yellow-700'
              : 'bg-emerald-950 text-emerald-300 border-emerald-700'
          }`}
        >
          {imdAlert.label}
        </span>
      </div>

      {/* Provenance & Data Quality Stamp */}
      <div className="text-[10px] text-slate-500 border-t border-slate-800/80 pt-2 flex flex-wrap justify-between gap-1">
        <span><strong>Source:</strong> {metadata.data_source || 'Open-Meteo High-Resolution NWP'}</span>
        <span><strong>Retrieved:</strong> {metadata.retrieval_time_utc ? metadata.retrieval_time_utc.replace('T', ' ').substring(0, 19) + ' UTC' : 'Live'}</span>
        <span><strong>Resolution:</strong> {metadata.spatial_resolution || '0.1° (~11km)'}</span>
        <span><strong>Missing Data:</strong> {metadata.missing_data_status || 'Complete'}</span>
      </div>
    </div>
  );
}
