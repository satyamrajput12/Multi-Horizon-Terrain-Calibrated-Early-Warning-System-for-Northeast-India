import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import GisMap from './components/GisMap';
import HorizonScrubber from './components/HorizonScrubber';
import LocationDetails from './components/LocationDetails';
import ForecastCharts from './components/ForecastCharts';
import SpatialRankingTable from './components/SpatialRankingTable';
import BenchmarkView from './components/BenchmarkView';
import AlertsDrawer from './components/AlertsDrawer';
import ProvenanceModal from './components/ProvenanceModal';
import { RefreshCw, Filter, MapPin, ChevronDown, ShieldCheck, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'ranking' | 'benchmark' | 'alerts' | 'provenance'
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [activeHorizon, setActiveHorizon] = useState('24h'); // '6h' | '12h' | '24h' | '48h' | '70h'
  
  // Data States
  const [riskData, setRiskData] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [corridors, setCorridors] = useState([]);
  const [showPolygons, setShowPolygons] = useState(true);
  const [showStations, setShowStations] = useState(true);
  const [historicalEvents, setHistoricalEvents] = useState([]);
  const [showHistoricalEvents, setShowHistoricalEvents] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [benchmarks, setBenchmarks] = useState(null);
  const [bhuvanLayers, setBhuvanLayers] = useState(null);

  // UI Settings
  const [tileLayerType, setTileLayerType] = useState('satellite');
  const [selectedStateFilter, setSelectedStateFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // 1. Initial Load: Locations, Historical Catalog, Benchmarks, Bhuvan Registry
  useEffect(() => {
    async function initData() {
      try {
        setLoading(true);
        const [locRes, histRes, benchRes, bhuvanRes, alertsRes] = await Promise.all([
          fetch('/api/locations'),
          fetch('/api/historical'),
          fetch('/api/benchmarks'),
          fetch('/api/bhuvan-layers'),
          fetch('/api/alerts')
        ]);

        const locData = await locRes.json();
        const histData = await histRes.json();
        const benchData = await benchRes.json();
        const bhuvanData = await bhuvanRes.json();
        const alertsData = await alertsRes.json();

        setLocations(locData);
        if (locData.length > 0) {
          // Default to high-risk Cherrapunji or Gangtok
          setSelectedLocation(locData[0]);
        }
        setHistoricalEvents(histData.events || []);
        setBenchmarks(benchData);
        setBhuvanLayers(bhuvanData);
        setAlerts(alertsData.alerts || []);
      } catch (err) {
        console.error('Failed to initialize EWS data:', err);
        setError('Failed to connect to MHTC-EWS backend. Please ensure the FastAPI engine is active.');
      } finally {
        setLoading(false);
      }
    }

    initData();
  }, []);

  // 2. Fetch Detailed Risk & Weather when Selected Location Changes
  useEffect(() => {
    if (!selectedLocation) return;

    async function fetchRisk() {
      try {
        setRefreshing(true);
        const res = await fetch(`/api/risk/${selectedLocation.id}`);
        if (!res.ok) throw new Error('Risk computation failed');
        const data = await res.json();
        setRiskData(data);
      } catch (err) {
        console.error('Error fetching risk for location:', err);
      } finally {
        setRefreshing(false);
      }
    }

    fetchRisk();
  }, [selectedLocation]);

  // 3. Fetch Spatial Rankings & Corridor Hazard Polygons when Active Horizon Changes
  useEffect(() => {
    async function fetchHorizonData() {
      try {
        const [rankRes, corrRes] = await Promise.all([
          fetch(`/api/ranking?horizon=${activeHorizon}`),
          fetch(`/api/corridors?horizon=${activeHorizon}`)
        ]);
        if (rankRes.ok) {
          const data = await rankRes.json();
          setRankings(data.rankings || []);
        }
        if (corrRes.ok) {
          const corrData = await corrRes.json();
          setCorridors(corrData.corridors || []);
        }
      } catch (err) {
        console.error('Failed to fetch horizon data:', err);
      }
    }

    fetchHorizonData();
  }, [activeHorizon]);

  // Filter Locations by State
  const filteredLocations = locations.filter((loc) => {
    if (selectedStateFilter !== 'ALL' && loc.state !== selectedStateFilter) return false;
    return true;
  });

  const statesList = ['ALL', 'Meghalaya', 'Sikkim', 'Assam', 'Mizoram', 'Nagaland', 'Arunachal Pradesh'];

  const handleSelectLocation = (loc) => {
    // If loc only has basic info from ranking or alert, find full location
    const fullLoc = locations.find((l) => l.id === loc.id || l.id === loc.location_id) || loc;
    setSelectedLocation(fullLoc);
    setActiveTab('map');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alertCount={alerts.length}
        isFallbackActive={riskData?.weather_metadata?.is_fallback}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Error Notification */}
        {error && (
          <div className="bg-red-950/80 border border-red-800 text-red-200 px-4 py-3 rounded-xl flex items-center gap-3 text-xs shadow-md">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <strong className="font-semibold text-white">System Connectivity Alert:</strong> {error}
            </div>
          </div>
        )}

        {/* Global Horizon Lead Time Selector */}
        <HorizonScrubber
          activeHorizon={activeHorizon}
          onSelectHorizon={setActiveHorizon}
          riskData={riskData}
        />

        {/* View Mode 1: GIS Map & Multi-Horizon Risk Inspector */}
        {activeTab === 'map' && (
          <div className="space-y-5">
            {/* Location & Filter Toolbar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Filter className="w-3.5 h-3.5" />
                  <span className="font-semibold text-slate-300">State:</span>
                </div>
                <select
                  value={selectedStateFilter}
                  onChange={(e) => setSelectedStateFilter(e.target.value)}
                  className="bg-slate-950 text-slate-200 border border-slate-800 rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  {statesList.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1.5 text-slate-400 ml-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-semibold text-slate-300">Monitored Corridor:</span>
                </div>
                <select
                  value={selectedLocation?.id || ''}
                  onChange={(e) => {
                    const loc = locations.find((l) => l.id === e.target.value);
                    if (loc) setSelectedLocation(loc);
                  }}
                  className="bg-slate-950 text-slate-200 border border-slate-800 rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-blue-500 cursor-pointer max-w-[260px] truncate"
                >
                  {filteredLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.district})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 text-slate-400">
                {refreshing && (
                  <span className="flex items-center gap-1.5 text-cyan-400 text-[11px]">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Computing NWP & Slope Fusion...
                  </span>
                )}
                <span className="font-mono text-[11px] text-slate-500">
                  {locations.length} Pilot Corridors Monitored
                </span>
              </div>
            </div>

            {/* Split Screen: GIS Leaflet Map & Location Profiler */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* GIS Map Canvas (7 cols on lg) */}
              <div className="lg:col-span-7 h-[560px]">
                <GisMap
                  locations={locations}
                  selectedLocation={selectedLocation}
                  onSelectLocation={handleSelectLocation}
                  activeHorizon={activeHorizon}
                  corridors={corridors}
                  showPolygons={showPolygons}
                  setShowPolygons={setShowPolygons}
                  showStations={showStations}
                  setShowStations={setShowStations}
                  historicalEvents={historicalEvents}
                  showHistoricalEvents={showHistoricalEvents}
                  setShowHistoricalEvents={setShowHistoricalEvents}
                  tileLayerType={tileLayerType}
                  setTileLayerType={setTileLayerType}
                />
              </div>

              {/* Location Detailed Analytics & Explainability (5 cols on lg) */}
              <div className="lg:col-span-5">
                <LocationDetails
                  location={selectedLocation}
                  riskData={riskData}
                  activeHorizon={activeHorizon}
                />
              </div>
            </div>

            {/* 70-Hour Forecast Evolution Charts */}
            <ForecastCharts
              weatherTimeline={riskData?.weather_timeline}
              riskData={riskData}
              selectedLocation={selectedLocation}
            />
          </div>
        )}

        {/* View Mode 2: Spatial Prioritization Ranking */}
        {activeTab === 'ranking' && (
          <SpatialRankingTable
            rankings={rankings}
            activeHorizon={activeHorizon}
            onSelectLocation={handleSelectLocation}
            selectedLocation={selectedLocation}
          />
        )}

        {/* View Mode 3: Model Benchmark & Empirical Validation */}
        {activeTab === 'benchmark' && (
          <BenchmarkView
            benchmarks={benchmarks}
            historicalEvents={historicalEvents}
          />
        )}

        {/* View Mode 4: Early Warning Advisory Console */}
        {activeTab === 'alerts' && (
          <AlertsDrawer
            alerts={alerts}
            onSelectLocation={handleSelectLocation}
          />
        )}

        {/* View Mode 5: Data Provenance & Bhuvan Layers */}
        {activeTab === 'provenance' && (
          <ProvenanceModal bhuvanLayers={bhuvanLayers} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 mt-12 py-6 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-semibold text-slate-400">
              MHTC-EWS: Multi-Horizon Terrain-Calibrated Early Warning System (NER)
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Smart India Hackathon 2026 &bull; Problem Statement ID 26001 &bull; Pilot Coverage: Northeast India
            </div>
          </div>
          <div className="text-right text-[11px] text-slate-500 space-y-0.5">
            <div>Geospatial & Meteorological Governance: ISRO Bhuvan / GSI NLSM / IMD MoES Guidelines</div>
            <div className="text-slate-600 font-mono">Prototype Lead Horizons: 6h &bull; 12h &bull; 24h &bull; 48h &bull; 70h (Research Target)</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
