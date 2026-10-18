# Multi-Horizon-Terrain-Calibrated-Early-Warning-System-for-Northeast-India

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_19-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Tooling-Vite-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![Leaflet](https://img.shields.io/badge/GIS-Leaflet-199900.svg?logo=leaflet&logoColor=white)](https://leafletjs.com)
[![TailwindCSS](https://img.shields.io/badge/Style-Tailwind_CSS_v4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

**MHTC-EWS (NER)** is a scientific, multi-horizon (6h, 12h, 24h, 48h, 70h) terrain-calibrated landslide early warning and risk forecasting system specifically designed for critical highway corridors across Northeast India (Meghalaya, Sikkim, Assam, Nagaland, Mizoram, Arunachal Pradesh).

---

## 🌟 Key Features

- **Multi-Horizon Lead Time Forecaster (6h - 70h)**:
  - Dynamically calculates terrain-aware shear susceptibility and hydrometeorological risk across multiple forecast windows.
- **Interactive GIS Hazard Mapping**:
  - High-resolution GIS interface with real-time road hazard polygons, pilot sensor arrays, and NASA Global Landslide Catalog (GLC) ground-truth validation.
  - Basemap switcher supporting High-Res Satellite Imagery, OpenStreetMap Terrain, and OpenTopoMap.
- **Topographic & Geomorphological Profiling**:
  - Real-time terrain metrics including Slope Angle, Elevation/Relief, GSI NLSM Susceptibility, and Topographic Wetness Index (TWI).
- **Spatial Prioritization Engine**:
  - Live ranking of critical corridors (SH-5, NH-10, NH-29, NH-27, NH-54, NH-13) to assist disaster authorities (DDMA, NDMA, BRO, SDRF).
- **High-Performance Architecture**:
  - FastAPI-powered Python backend fusing NWP atmospheric forecasts (ECMWF/GFS IFS Ensemble) with geotechnical slope models.
  - Ultra-fast React 19 + Tailwind CSS frontend with dark and light GIS themes.

---

## 🏗️ System Architecture

```
Landslide Prediction/
├── backend/
│   ├── main.py                  # FastAPI server & API endpoints
│   ├── test_api.py              # Test harness for model & weather service
│   ├── services/
│   │   ├── weather_service.py   # High-resolution NWP weather integration
│   │   ├── model_service.py     # Terrain-calibrated landslide risk engine
│   │   └── early_warning_service.py # Threshold & advisory dispatch engine
│   └── data/
│       ├── locations.json       # Monitored pilot corridor profiles
│       ├── historical_landslides.json # GSI & NASA disaster records
│       ├── bhuvan_layers.json   # ISRO Bhuvan satellite layer configs
│       └── corridor_hazard_polygons.json # Highway risk polygons
├── frontend/
│   ├── src/                     # React application source code
│   ├── public/                  # Static assets & dashboard
│   ├── package.json             # NPM dependencies
│   └── vite.config.js           # Vite config with API proxy
├── dashboard.html               # Self-contained GIS Dashboard
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
pip install fastapi uvicorn requests numpy pandas scikit-learn

# Run the FastAPI engine
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
API docs available at: `http://127.0.0.1:8000/docs`

### 3. Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open application at: `http://localhost:5173`

---

## 📡 Core API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | GET | EWS service health and loaded pilot corridors |
| `/api/locations` | GET | Catalog of monitored Northeast India corridors |
| `/api/risk/{location_id}` | GET | Multi-horizon risk scores & terrain profile |
| `/api/ranking?horizon=24h` | GET | Spatial prioritization of corridors |
| `/api/corridors?horizon=24h`| GET | Highway hazard polygon geometries |
| `/api/alerts` | GET | Automated early warning bulletins |
| `/api/benchmarks` | GET | Precision, recall, and ROC-AUC metrics |

---

## 📄 License
Research & evaluation prototype for early warning and disaster mitigation.
