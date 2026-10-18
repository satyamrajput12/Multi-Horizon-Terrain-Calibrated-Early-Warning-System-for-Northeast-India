import React from 'react';
import { Database, ShieldCheck, ExternalLink, CheckCircle, AlertTriangle, Layers } from 'lucide-react';

export default function ProvenanceModal({ bhuvanLayers }) {
  const layers = bhuvanLayers?.layers || [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-bold text-white">
            Indian Geospatial & Meteorological Data Provenance Registry
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Strict compliance with Indian data governance, licensing terms, and transparent provenance attribution
        </p>
      </div>

      {/* Compliance & Policy Statement */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
          <ShieldCheck className="w-4 h-4" />
          National Geospatial Policy (NGP 2022) & MoES Compliance
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          All geospatial layers, landslide hazard zonation vectors, and digital elevation models integrated into the MHTC-EWS prototype respect the guidelines of the <strong>National Geospatial Policy (2022)</strong> and the <strong>Ministry of Earth Sciences (MoES)</strong>. Data providers are credited directly; no private API is silently masqueraded as an official government stream.
        </p>
      </div>

      {/* Registered Datasets Table */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          Registered Indian Geospatial & Meteorological Services
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {layers.map((layer) => (
            <div
              key={layer.layer_id}
              className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white text-xs">{layer.layer_name}</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                    {layer.service_type}
                  </span>
                </div>
                <div className="text-[11px] text-blue-400 font-medium mb-2">{layer.provider}</div>

                <div className="space-y-1 text-slate-400 text-[11px] mb-3">
                  <div>
                    <strong className="text-slate-300">Spatial Resolution:</strong> {layer.spatial_resolution}
                  </div>
                  <div>
                    <strong className="text-slate-300">Access Method:</strong> {layer.access_method}
                  </div>
                  <div>
                    <strong className="text-slate-300">Coverage:</strong> {layer.coverage}
                  </div>
                  <div>
                    <strong className="text-slate-300">Status:</strong>{' '}
                    <span className="text-emerald-400 font-semibold">{layer.status}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-2 text-[10px] text-slate-500">
                <div className="mb-1"><strong className="text-slate-400">Licensing & Terms:</strong> {layer.licensing_terms}</div>
                <a
                  href={layer.endpoint_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline flex items-center gap-1 mt-1"
                >
                  Visit Official Portal
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 70-Hour Forecast Horizon Data Integrity & Limitations */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
        <h3 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          70-Hour Lead Horizon: Uncertainty Boundaries & Scientific Limitations
        </h3>
        <ul className="list-disc list-inside space-y-1.5 text-slate-400 text-[11px]">
          <li>
            <strong>Atmospheric Model Divergence:</strong> Numerical weather prediction (NWP) precipitation trajectories display increasing dispersion beyond 36-48 hours. At the 70-hour research horizon, risk categories indicate synoptic trend potential rather than exact localized flash points.
          </li>
          <li>
            <strong>Hydrologic Threshold Dynamics:</strong> In steep crystalline catchments (such as East Khasi Hills and Sikkim Himalayas), the antecedent saturation index (API 72-hour index) critically lowers the rainfall triggering threshold by up to 45%.
          </li>
          <li>
            <strong>Fallback Verification:</strong> In the event of network disruption or gateway timeouts, the system transitions to a documented deterministic seasonal fallback while visibly flagging the data provenance to preserve scientific integrity.
          </li>
        </ul>
      </div>
    </div>
  );
}
