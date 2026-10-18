import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, Eye, Mountain, Compass, ShieldAlert, Sparkles, Navigation2 } from 'lucide-react';

export default function GisMap({
  locations,
  selectedLocation,
  onSelectLocation,
  activeHorizon,
  corridors,
  showPolygons,
  setShowPolygons,
  showStations,
  setShowStations,
  historicalEvents,
  showHistoricalEvents,
  setShowHistoricalEvents,
  tileLayerType,
  setTileLayerType
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const polygonsLayerRef = useRef(null);
  const historicalLayerRef = useRef(null);
  const baseTileLayerRef = useRef(null);
  const labelTileLayerRef = useRef(null);

  const [activeSegment, setActiveSegment] = useState(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center on Sikkim / Teesta valley or central NER
    const map = L.map(mapContainerRef.current, {
      center: [27.33, 88.60],
      zoom: 9,
      minZoom: 5,
      maxZoom: 18,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;
    polygonsLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);
    historicalLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
    };
  }, []);

  // Update Basemap Tiles (Satellite / Hybrid / Dark / Topo)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (baseTileLayerRef.current) {
      mapInstanceRef.current.removeLayer(baseTileLayerRef.current);
    }
    if (labelTileLayerRef.current) {
      mapInstanceRef.current.removeLayer(labelTileLayerRef.current);
      labelTileLayerRef.current = null;
    }

    let baseTileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    let baseAttribution = '&copy; Esri, Maxar, Earthstar Geographics, CNES/Airbus DS';

    if (tileLayerType === 'dark') {
      baseTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      baseAttribution = '&copy; CARTO &copy; OSM';
    } else if (tileLayerType === 'topo') {
      baseTileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      baseAttribution = '&copy; OpenTopoMap &copy; OSM';
    } else if (tileLayerType === 'hybrid') {
      baseTileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      baseAttribution = '&copy; Esri World Imagery';
      // Add transparent boundaries & places labels
      labelTileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      ).addTo(mapInstanceRef.current);
    }

    baseTileLayerRef.current = L.tileLayer(baseTileUrl, {
      attribution: baseAttribution,
      maxZoom: 19
    }).addTo(mapInstanceRef.current);

    // If hybrid, keep label on top
    if (labelTileLayerRef.current) {
      labelTileLayerRef.current.bringToFront();
    }
  }, [tileLayerType]);

  // Render Corridor Hazard Polygons & Road Swaths (eyeRADAR style)
  useEffect(() => {
    if (!polygonsLayerRef.current) return;

    polygonsLayerRef.current.clearLayers();

    if (showPolygons && corridors && corridors.length > 0) {
      corridors.forEach((corr) => {
        corr.segments.forEach((seg) => {
          // Leaflet expects [lat, lon]
          const polygon = L.polygon(seg.polygon, {
            color: '#ffffff',
            weight: 1.5,
            fillColor: seg.color,
            fillOpacity: seg.fill_opacity || 0.6,
            className: 'hazard-swath-poly'
          });

          // Interactive tooltip
          polygon.bindTooltip(
            `<strong>${corr.highway_no} - ${seg.name}</strong><br/>
             Chainage: ${seg.chainage}<br/>
             Risk Score: <span style="color:${seg.color}; font-weight:bold;">${seg.current_risk_score}</span> (${seg.risk_tier.split(' ')[0]})<br/>
             Slope: ${seg.slope_deg}° | Forecast: ${seg.forecast_rainfall_mm}mm`,
            { sticky: true, className: 'leaflet-hazard-tooltip' }
          );

          polygon.on('mouseover', function () {
            this.setStyle({
              weight: 3.5,
              color: '#38bdf8',
              fillOpacity: 0.85
            });
          });

          polygon.on('mouseout', function () {
            this.setStyle({
              weight: 1.5,
              color: '#ffffff',
              fillOpacity: seg.fill_opacity || 0.6
            });
          });

          polygon.on('click', () => {
            setActiveSegment({
              ...seg,
              corridorName: corr.name,
              highwayNo: corr.highway_no,
              state: corr.state,
              district: corr.district
            });
          });

          polygon.addTo(polygonsLayerRef.current);
        });
      });
    }
  }, [corridors, showPolygons, activeHorizon]);

  // Render Pilot Monitoring Stations
  useEffect(() => {
    if (!markersLayerRef.current || !locations) return;

    markersLayerRef.current.clearLayers();

    if (showStations) {
      locations.forEach((loc) => {
        const isSelected = selectedLocation && selectedLocation.id === loc.id;
        let markerColor = '#22c55e';
        if (loc.gsi_susceptibility === 'Very High') markerColor = '#f97316';
        if (loc.slope_deg >= 40) markerColor = '#ef4444';

        const markerHtml = `
          <div style="
            background-color: ${markerColor};
            width: ${isSelected ? '22px' : '16px'};
            height: ${isSelected ? '22px' : '16px'};
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 12px ${markerColor};
            cursor: pointer;
            transition: transform 0.2s;
          "></div>
        `;

        const customIcon = L.divIcon({
          className: 'custom-station-pin',
          html: markerHtml,
          iconSize: [isSelected ? 22 : 16, isSelected ? 22 : 16],
          iconAnchor: [isSelected ? 11 : 8, isSelected ? 11 : 8]
        });

        const marker = L.marker([loc.latitude, loc.longitude], { icon: customIcon });

        const popupHtml = `
          <div style="font-family: inherit; font-size: 12px; line-height: 1.4; min-width: 190px;">
            <div style="font-weight: bold; font-size: 13px; color: #60a5fa; margin-bottom: 4px;">${loc.name}</div>
            <div style="color: #cbd5e1; margin-bottom: 2px;"><strong>District:</strong> ${loc.district}, ${loc.state}</div>
            <div style="color: #cbd5e1; margin-bottom: 2px;"><strong>Corridor:</strong> ${loc.critical_corridor}</div>
            <div style="color: #cbd5e1; margin-bottom: 2px;"><strong>Slope:</strong> ${loc.slope_deg}° | <strong>Elev:</strong> ${loc.elevation_m}m</div>
            <div style="color: #cbd5e1; margin-bottom: 6px;"><strong>GSI Susceptibility:</strong> <span style="color: ${markerColor}; font-weight: bold;">${loc.gsi_susceptibility}</span></div>
          </div>
        `;

        marker.bindPopup(popupHtml);
        marker.on('click', () => {
          onSelectLocation(loc);
        });

        marker.addTo(markersLayerRef.current);
      });
    }
  }, [locations, selectedLocation, showStations, activeHorizon]);

  // Render NASA GLC Historical Event Markers
  useEffect(() => {
    if (!historicalLayerRef.current) return;

    historicalLayerRef.current.clearLayers();

    if (showHistoricalEvents && historicalEvents) {
      historicalEvents.forEach((ev) => {
        const diamondHtml = `
          <div style="
            background-color: #ec4899;
            width: 14px;
            height: 14px;
            transform: rotate(45deg);
            border: 1.5px solid #ffffff;
            box-shadow: 0 0 8px #ec4899;
            cursor: pointer;
          "></div>
        `;

        const icon = L.divIcon({
          className: 'historical-diamond',
          html: diamondHtml,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        const marker = L.marker([ev.latitude, ev.longitude], { icon });

        const popupHtml = `
          <div style="font-family: inherit; font-size: 12px; line-height: 1.4; min-width: 210px;">
            <div style="font-weight: bold; font-size: 13px; color: #f472b6; margin-bottom: 4px;">${ev.location_name}</div>
            <div style="color: #cbd5e1; margin-bottom: 2px;"><strong>Event Date:</strong> ${ev.event_date.split('T')[0]}</div>
            <div style="color: #cbd5e1; margin-bottom: 2px;"><strong>Category:</strong> ${ev.landslide_category}</div>
            <div style="color: #cbd5e1; margin-bottom: 2px;"><strong>Trigger:</strong> ${ev.trigger_type}</div>
            <div style="color: #cbd5e1; margin-bottom: 2px;"><strong>Impact:</strong> ${ev.economic_impact}</div>
            <div style="color: #cbd5e1; margin-bottom: 4px;"><strong>Fatalities:</strong> ${ev.fatalities}</div>
            <div style="border-top: 1px solid #475569; padding-top: 4px; font-size: 10px; color: #94a3b8;">
              Source: ${ev.source}
            </div>
          </div>
        `;

        marker.bindPopup(popupHtml);
        marker.addTo(historicalLayerRef.current);
      });
    }
  }, [historicalEvents, showHistoricalEvents]);

  // Fly to selected location
  useEffect(() => {
    if (selectedLocation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedLocation.latitude, selectedLocation.longitude], 12, {
        duration: 1.2
      });
    }
  }, [selectedLocation]);

  const handleFlyToCorridor = (corr) => {
    if (mapInstanceRef.current && corr.center) {
      mapInstanceRef.current.flyTo(corr.center, 13, { duration: 1.4 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[580px] rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-2xl">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[580px]" />

      {/* Top Floating Corridor Quick-Fly Bar (Google/Apple Maps style) */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/80 shadow-lg text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1 text-[11px] uppercase tracking-wider pr-1">
            <Navigation2 className="w-3.5 h-3.5 text-blue-400" />
            Corridors:
          </span>
          {(corridors || []).map((corr) => (
            <button
              key={corr.corridor_id}
              onClick={() => handleFlyToCorridor(corr)}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800/90 text-slate-200 hover:bg-blue-600 hover:text-white transition shadow-sm border border-slate-700"
            >
              {corr.highway_no} ({corr.state})
            </button>
          ))}
        </div>

        {/* Basemap Switcher (Satellite Photomap / Hybrid / Dark / Topo) */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md p-1 rounded-full border border-slate-700/80 shadow-lg flex items-center gap-1 text-xs">
          <button
            onClick={() => setTileLayerType('satellite')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              tileLayerType === 'satellite' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            🛰️ Satellite
          </button>
          <button
            onClick={() => setTileLayerType('hybrid')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              tileLayerType === 'hybrid' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            🗺️ Hybrid
          </button>
          <button
            onClick={() => setTileLayerType('dark')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
              tileLayerType === 'dark' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Dark GIS
          </button>
          <button
            onClick={() => setTileLayerType('topo')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
              tileLayerType === 'topo' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Topo
          </button>
        </div>
      </div>

      {/* Layer Visibility Toggles (eyeRADAR style) */}
      <div className="absolute top-16 left-3 z-[1000] flex flex-col gap-2">
        <div className="bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/80 shadow-xl space-y-2 text-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Layer Visibility
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-slate-200 hover:text-white">
            <input
              type="checkbox"
              checked={showPolygons}
              onChange={(e) => setShowPolygons(e.target.checked)}
              className="rounded bg-slate-800 border-slate-600 text-blue-500 focus:ring-0 cursor-pointer"
            />
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 rounded-sm"></span>
              Road Hazard Polygons
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-200 hover:text-white">
            <input
              type="checkbox"
              checked={showStations}
              onChange={(e) => setShowStations(e.target.checked)}
              className="rounded bg-slate-800 border-slate-600 text-emerald-500 focus:ring-0 cursor-pointer"
            />
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white"></span>
              Pilot Monitoring Points
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-200 hover:text-white">
            <input
              type="checkbox"
              checked={showHistoricalEvents}
              onChange={(e) => setShowHistoricalEvents(e.target.checked)}
              className="rounded bg-slate-800 border-slate-600 text-pink-500 focus:ring-0 cursor-pointer"
            />
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 bg-pink-500 transform rotate-45 border border-white"></span>
              NASA GLC Disaster Spots
            </span>
          </label>
        </div>
      </div>

      {/* eyeRADAR Style Vertical Color Gradient Legend (glm / Risk Index) */}
      <div className="absolute bottom-6 left-4 z-[1000] bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700/80 shadow-2xl flex flex-col items-center text-xs">
        <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest mb-2">
          glm risk
        </span>
        <div className="flex items-center gap-2.5">
          {/* Vertical Bar */}
          <div
            className="w-4 h-32 rounded-full border border-white/60 shadow-inner"
            style={{
              background: 'linear-gradient(to top, #22c55e 0%, #eab308 35%, #f97316 65%, #ef4444 100%)'
            }}
          />
          {/* Scale Ticks */}
          <div className="flex flex-col justify-between h-32 text-[10px] font-mono font-bold text-slate-300">
            <span className="text-red-400">&ge; 0.70</span>
            <span className="text-orange-400">0.50</span>
            <span className="text-yellow-400">0.30</span>
            <span className="text-emerald-400">0.10</span>
          </div>
        </div>
        <div className="text-[9px] text-slate-400 mt-2 text-center font-medium">
          Multi-Horizon <br />
          Threat Index
        </div>
      </div>

      {/* Segment Inspection Card (when user clicks a polygon swath) */}
      {activeSegment && (
        <div className="absolute bottom-6 right-4 z-[1000] max-w-sm w-full bg-slate-900/95 backdrop-blur-lg p-4 rounded-2xl border border-blue-500/50 shadow-2xl text-xs space-y-2 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
            <div>
              <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded-full font-mono border border-blue-800">
                {activeSegment.highwayNo}
              </span>
              <h4 className="text-sm font-bold text-white mt-1">{activeSegment.name}</h4>
              <p className="text-[11px] text-slate-400">
                {activeSegment.district}, {activeSegment.state} &bull; {activeSegment.chainage}
              </p>
            </div>
            <button
              onClick={() => setActiveSegment(null)}
              className="text-slate-400 hover:text-white text-base leading-none p-1"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px]">Slope Angle</span>
              <div className="text-sm font-bold text-amber-400">{activeSegment.slope_deg}°</div>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px]">Forecast Rain ({activeHorizon})</span>
              <div className="text-sm font-bold text-cyan-400">{activeSegment.forecast_rainfall_mm} mm</div>
            </div>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1 text-[11px]">
            <div>
              <strong className="text-slate-300">Vulnerability:</strong>{' '}
              <span className="text-red-300">{activeSegment.vulnerability_type}</span>
            </div>
            <div>
              <strong className="text-slate-300">Lithology:</strong> {activeSegment.geology}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-400">Status @ {activeHorizon}:</span>
            <span
              className="px-2.5 py-1 rounded-full text-xs font-bold text-white shadow"
              style={{ backgroundColor: activeSegment.color }}
            >
              Score: {activeSegment.current_risk_score} &bull; {activeSegment.risk_tier.split(' ')[0]}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
