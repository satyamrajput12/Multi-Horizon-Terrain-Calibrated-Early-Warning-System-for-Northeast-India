import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from services.weather_service import WeatherService
from services.model_service import ModelService
from services.early_warning_service import EarlyWarningService

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("main")

app = FastAPI(
    title="Intelligent Landslide Prediction & Early Warning System (NER)",
    description="Scientific 70-Hour Multi-Horizon Landslide Risk Forecasting Prototype for Northeast India — SIH 2026 PS 26001",
    version="1.0.0"
)

# Enable CORS for frontend Vite dev server and local access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

# Load Core Datasets
with open(DATA_DIR / "locations.json", "r", encoding="utf-8") as f:
    LOCATIONS: List[Dict[str, Any]] = json.load(f)

with open(DATA_DIR / "historical_landslides.json", "r", encoding="utf-8") as f:
    HISTORICAL_EVENTS: List[Dict[str, Any]] = json.load(f)

with open(DATA_DIR / "bhuvan_layers.json", "r", encoding="utf-8") as f:
    BHUVAN_LAYERS: List[Dict[str, Any]] = json.load(f)

with open(DATA_DIR / "corridor_hazard_polygons.json", "r", encoding="utf-8") as f:
    CORRIDORS: List[Dict[str, Any]] = json.load(f)

# Initialize Services
weather_service = WeatherService()
model_service = ModelService(HISTORICAL_EVENTS)
early_warning_service = EarlyWarningService()

@app.get("/api/health")
def get_health():
    return {
        "status": "healthy",
        "service": "MHTC-EWS Backend Engine",
        "pilot_locations_loaded": len(LOCATIONS),
        "historical_events_loaded": len(HISTORICAL_EVENTS),
        "target_horizons": [6, 12, 24, 48, 70],
        "disclaimer": "Experimental prototype for research & hackathon evaluation."
    }

@app.get("/api/locations")
def get_locations(state: Optional[str] = None):
    if state:
        return [loc for loc in LOCATIONS if loc["state"].lower() == state.lower()]
    return LOCATIONS

@app.get("/api/weather/{location_id}")
def get_weather_forecast(location_id: str):
    loc = next((l for l in LOCATIONS if l["id"] == location_id), None)
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    return weather_service.get_forecast(loc["latitude"], loc["longitude"], loc["id"])

@app.get("/api/risk/{location_id}")
def get_location_risk(location_id: str):
    loc = next((l for l in LOCATIONS if l["id"] == location_id), None)
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    
    weather_data = weather_service.get_forecast(loc["latitude"], loc["longitude"], loc["id"])
    risk_data = model_service.compute_multi_horizon_risk(loc, weather_data)
    
    # Attach provenance & data quality
    risk_data["weather_metadata"] = {
        "data_source": weather_data["data_source"],
        "is_fallback": weather_data.get("is_fallback", False),
        "retrieval_time_utc": weather_data["retrieval_time_utc"],
        "valid_time_utc": weather_data["valid_time_utc"],
        "spatial_resolution": weather_data["spatial_resolution"],
        "missing_data_status": weather_data["missing_data_status"]
    }
    risk_data["weather_timeline"] = weather_data["timeline"]
    risk_data["antecedent_rainfall"] = weather_data["antecedent_rainfall"]
    risk_data["imd_reference_alert"] = weather_data["imd_reference_alert"]
    
    return risk_data

@app.get("/api/ranking")
def get_spatial_risk_ranking(horizon: str = Query("24h", description="Horizon: 6h, 12h, 24h, 48h, 70h")):
    """
    Ranks all monitored pilot locations across Northeast India by estimated risk
    for the selected horizon to support spatial prioritization.
    """
    rankings = []
    for loc in LOCATIONS:
        weather_data = weather_service.get_forecast(loc["latitude"], loc["longitude"], loc["id"])
        risk_data = model_service.compute_multi_horizon_risk(loc, weather_data)
        
        h_info = risk_data["horizons"].get(horizon, risk_data["horizons"]["24h"])
        rankings.append({
            "location_id": loc["id"],
            "name": loc["name"],
            "state": loc["state"],
            "district": loc["district"],
            "critical_corridor": loc.get("critical_corridor"),
            "latitude": loc["latitude"],
            "longitude": loc["longitude"],
            "slope_deg": loc["slope_deg"],
            "gsi_susceptibility": loc["gsi_susceptibility"],
            "horizon": horizon,
            "risk_score": h_info["terrain_aware_risk_score"],
            "risk_category": h_info["risk_category"],
            "alert_code": h_info["alert_code"],
            "accumulated_rain_mm": h_info["accumulated_rainfall_mm"],
            "ml_probability": h_info["ml_probability"],
            "imd_reference": weather_data["imd_reference_alert"]["code"]
        })
    
    # Sort descending by risk score
    rankings.sort(key=lambda x: x["risk_score"], reverse=True)
    return {
        "horizon": horizon,
        "total_monitored_locations": len(rankings),
        "rankings": rankings
    }

@app.get("/api/historical")
def get_historical_landslides():
    return {
        "source": "NASA Global Landslide Catalog & Indian Geological Records",
        "count": len(HISTORICAL_EVENTS),
        "events": HISTORICAL_EVENTS
    }

@app.get("/api/benchmarks")
def get_benchmarks():
    return model_service.evaluate_model_benchmarks()

@app.get("/api/bhuvan-layers")
def get_bhuvan_layers():
    return {
        "geoportal": "ISRO Bhuvan / GSI Bhukosh / IMD Mausam",
        "layers": BHUVAN_LAYERS
    }

@app.get("/api/corridors")
def get_corridor_polygons(horizon: str = Query("24h", description="Horizon: 6h, 12h, 24h, 48h, 70h")):
    """
    Returns high-resolution highway hazard polygons and slope swaths across Northeast India,
    dynamically evaluated against forecast precipitation and antecedent saturation.
    """
    threshold_map = {"6h": 45.0, "12h": 65.0, "24h": 100.0, "48h": 150.0, "70h": 200.0}
    thresh = threshold_map.get(horizon, 100.0)

    evaluated_corridors = []
    for corr in CORRIDORS:
        center_lat, center_lon = corr["center"]
        weather = weather_service.get_forecast(center_lat, center_lon, corr["corridor_id"])
        h_accum = weather.get("forecast_accumulations", {}).get(f"h{horizon[:2]}_mm" if horizon in ["6h", "12h", "24h", "48h"] else "h70_mm", 25.0)
        ant_72 = weather.get("antecedent_rainfall", {}).get("past_72h_mm", 40.0)
        
        rain_ratio = min(1.0, h_accum / thresh)
        api_ratio = min(1.0, ant_72 / 160.0)

        evaluated_segments = []
        for seg in corr["segments"]:
            slope_deg = seg["slope_deg"]
            base_risk = seg["base_risk"]
            slope_norm = min(1.0, max(0.0, (slope_deg - 15.0) / 27.0))

            # Fused polygon danger score
            score = (base_risk * 0.40) + (rain_ratio * 0.30) + (api_ratio * 0.15) + (slope_norm * 0.15)
            score = round(float(min(1.0, max(0.05, score))), 3)

            # Color gradient: green -> yellow -> orange -> red
            if score >= 0.70:
                color = "#ef4444"
                risk_tier = "Severe Hazard (Critical Slope Failure)"
                fill_opacity = 0.65
            elif score >= 0.50:
                color = "#f97316"
                risk_tier = "High Hazard (Debris & Rockfall Watch)"
                fill_opacity = 0.55
            elif score >= 0.30:
                color = "#eab308"
                risk_tier = "Moderate Threat (Localized Creep)"
                fill_opacity = 0.45
            else:
                color = "#22c55e"
                risk_tier = "Low Threat (Nominal Traffic Safety)"
                fill_opacity = 0.35

            evaluated_segments.append({
                **seg,
                "current_risk_score": score,
                "risk_tier": risk_tier,
                "color": color,
                "fill_opacity": fill_opacity,
                "forecast_rainfall_mm": h_accum,
                "antecedent_72h_mm": ant_72
            })

        evaluated_corridors.append({
            "corridor_id": corr["corridor_id"],
            "name": corr["name"],
            "highway_no": corr["highway_no"],
            "state": corr["state"],
            "district": corr["district"],
            "description": corr["description"],
            "center": corr["center"],
            "segments": evaluated_segments
        })

    return {
        "horizon": horizon,
        "corridor_count": len(evaluated_corridors),
        "corridors": evaluated_corridors
    }

@app.get("/api/alerts")
def get_all_alerts():
    all_alerts = []
    for loc in LOCATIONS:
        weather_data = weather_service.get_forecast(loc["latitude"], loc["longitude"], loc["id"])
        risk_data = model_service.compute_multi_horizon_risk(loc, weather_data)
        loc_alerts = early_warning_service.evaluate_location_alerts(risk_data, weather_data, loc)
        all_alerts.extend(loc_alerts)
    
    # Sort alerts by severity (highest score first) and lead time
    all_alerts.sort(key=lambda x: (x["risk_score"], -x["lead_hours"]), reverse=True)
    return {
        "timestamp_utc": weather_service.get_forecast(LOCATIONS[0]["latitude"], LOCATIONS[0]["longitude"], LOCATIONS[0]["id"])["retrieval_time_utc"],
        "active_alerts_count": len(all_alerts),
        "alerts": all_alerts,
        "disclaimer": "PROTOTYPE EXPERIMENTAL ALERTS: For evaluation purposes only. Verify against official IMD/GSI/SDMA advisories."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
