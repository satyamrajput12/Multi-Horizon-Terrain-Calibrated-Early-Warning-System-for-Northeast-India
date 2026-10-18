import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent))

try:
    import main
    print("Backend loaded successfully!")
    # Test one calculation
    loc = main.LOCATIONS[0]
    weather = main.weather_service.get_forecast(loc["latitude"], loc["longitude"], loc["id"])
    print(f"Weather fetched: source={weather['data_source']}, is_fallback={weather.get('is_fallback')}")
    risk = main.model_service.compute_multi_horizon_risk(loc, weather)
    print(f"Risk computed: 24h score={risk['horizons']['24h']['terrain_aware_risk_score']}")
    benchmarks = main.model_service.evaluate_model_benchmarks()
    print(f"Benchmarks: MHTC Precision={benchmarks['mhtc_terrain_aware_system']['precision']}, Recall={benchmarks['mhtc_terrain_aware_system']['recall']}")
except Exception as e:
    import traceback
    traceback.print_exc()
