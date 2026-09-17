# ml-service/app/preprocessing.py
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple

# Baseline plant operating thresholds (EPA / WHO Standards for treated water)
DEFAULT_STANDARDS = {
    "ph_min": 6.5,
    "ph_max": 8.5,
    "turbidity_max": 5.0, # NTU
    "tds_max": 500.0,     # ppm
    "temp_min": 15.0,     # °C
    "temp_max": 32.0,     # °C
    "chlorine_min": 0.2,  # mg/L
    "chlorine_max": 2.0,  # mg/L
    "flow_min": 500.0,    # L/min
    "flow_max": 2000.0    # L/min
}

def extract_features(data: Dict[str, Any]) -> np.ndarray:
    """
    Extracts and standardizes numeric feature vector for scikit-learn models.
    Vector shape: [1, 6] -> [ph, turbidity, tds, temperature, chlorine, flow_rate]
    """
    features = [
        float(data.get("ph", 7.0)),
        float(data.get("turbidity", 1.0)),
        float(data.get("tds", 300.0)),
        float(data.get("temperature", 25.0)),
        float(data.get("chlorine", 0.5)),
        float(data.get("flow_rate", 1200.0))
    ]
    return np.array(features).reshape(1, -1)

def validate_sensor_ranges(data: Dict[str, Any]) -> Tuple[bool, list]:
    """
    Validates sensor physical feasibility bounds to reject corrupted telemetry.
    """
    errors = []
    ph = data.get("ph", 7.0)
    turbidity = data.get("turbidity", 0.0)
    tds = data.get("tds", 0.0)
    temp = data.get("temperature", 20.0)
    chlorine = data.get("chlorine", 0.5)
    flow = data.get("flow_rate", 0.0)

    if ph < 0 or ph > 14:
        errors.append(f"Invalid physical pH reading: {ph}")
    if turbidity < 0:
        errors.append(f"Turbidity cannot be negative: {turbidity}")
    if tds < 0:
        errors.append(f"TDS cannot be negative: {tds}")
    if temp < -5 or temp > 100:
        errors.append(f"Temperature outside operational sensor range: {temp}")
    if chlorine < 0:
        errors.append(f"Chlorine cannot be negative: {chlorine}")
    if flow < 0:
        errors.append(f"Flow rate cannot be negative: {flow}")

    return len(errors) == 0, errors
