import React, { useState } from 'react';
import { ArrowUpDown, AlertCircle, Mountain, MapPin, ExternalLink, Filter } from 'lucide-react';

export default function SpatialRankingTable({
  rankings,
  activeHorizon,
  onSelectLocation,
  selectedLocation
}) {
  const [stateFilter, setStateFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('risk_score');
  const [sortOrder, setSortOrder] = useState('desc');

  const states = ['ALL', 'Meghalaya', 'Sikkim', 'Assam', 'Mizoram', 'Nagaland', 'Arunachal Pradesh'];

  const filtered = (rankings || []).filter((item) => {
    if (stateFilter !== 'ALL' && item.state !== stateFilter) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const mult = sortOrder === 'desc' ? -1 : 1;
    if (sortBy === 'risk_score') return (a.risk_score - b.risk_score) * mult;
    if (sortBy === 'accumulated_rain_mm') return (a.accumulated_rain_mm - b.accumulated_rain_mm) * mult;
    if (sortBy === 'slope_deg') return (a.slope_deg - b.slope_deg) * mult;
    return 0;
  });

  const toggleSort = (col) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
      {/* Header & State Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Mountain className="w-4 h-4 text-blue-400" />
            Spatial Prioritization: Regional Corridors Ranked by Threat ({activeHorizon})
          </h3>
          <p className="text-xs text-slate-400">
            Identifying high-risk arteries requiring immediate patrol staging and drainage inspection
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 font-medium">State:</span>
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="bg-slate-950 text-slate-200 border border-slate-800 rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            {states.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
              <th className="py-2 px-3 font-semibold">Priority Rank</th>
              <th className="py-2 px-3 font-semibold">Monitored Corridor & District</th>
              <th
                onClick={() => toggleSort('risk_score')}
                className="py-2 px-3 font-semibold cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  MHTC Risk Score ({activeHorizon})
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('accumulated_rain_mm')}
                className="py-2 px-3 font-semibold cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  Forecast Rain
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('slope_deg')}
                className="py-2 px-3 font-semibold cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  Slope (°)
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2 px-3 font-semibold">GSI Susceptibility</th>
              <th className="py-2 px-3 font-semibold">IMD Code</th>
              <th className="py-2 px-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sorted.map((item, idx) => {
              const isSelected = selectedLocation && selectedLocation.id === item.location_id;
              
              let badgeColor = 'bg-emerald-950 text-emerald-400 border-emerald-800';
              if (item.risk_category.includes('Severe') || item.risk_score >= 0.75) {
                badgeColor = 'bg-red-950 text-red-400 border-red-800 animate-pulse';
              } else if (item.risk_score >= 0.55) {
                badgeColor = 'bg-orange-950 text-orange-400 border-orange-800';
              } else if (item.risk_score >= 0.35) {
                badgeColor = 'bg-yellow-950 text-yellow-400 border-yellow-800';
              }

              return (
                <tr
                  key={item.location_id}
                  className={`transition hover:bg-slate-800/40 ${
                    isSelected ? 'bg-blue-950/40 border-l-2 border-blue-500' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-300">
                    #{idx + 1}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-white">{item.name}</div>
                    <div className="text-[11px] text-slate-400">
                      {item.critical_corridor} &bull; {item.district}, {item.state}
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${badgeColor}`}>
                        {item.risk_score}
                      </span>
                      <span className="text-[11px] text-slate-400 hidden sm:inline">
                        {item.risk_category}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-cyan-400 font-medium">
                    {item.accumulated_rain_mm} mm
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 font-mono">
                    {item.slope_deg}°
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[11px] text-amber-300 font-medium">
                      {item.gsi_susceptibility}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {item.imd_reference}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onSelectLocation(item)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition text-[11px] font-medium"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
