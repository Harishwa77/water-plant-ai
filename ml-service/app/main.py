# ml-service/app/main.py
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from .models import WaterReadingInput, PredictionOutput
from .preprocessing import validate_sensor_ranges
from .risk import WaterPlantRiskEngine
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("water-plant-ml")

app = FastAPI(
    title="Water Plant AI - ML Prediction & Anomaly Engine",
    description="Microservice providing real-time unsupervised Isolation Forest anomaly detection, Random Forest water quality classification, and deterministic safety rules.",
    version="3.4.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Risk Engine
risk_engine = WaterPlantRiskEngine()

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "water-plant-ai-ml-service",
        "version": "3.4.0",
        "models": ["IsolationForest", "RandomForestClassifier", "DeterministicRuleSafetyEngine"]
    }

@app.post("/predict", response_model=PredictionOutput)
def predict_water_quality(reading: WaterReadingInput):
    data_dict = reading.model_dump()
    
    # 1. Physical validation
    is_valid, errors = validate_sensor_ranges(data_dict)
    if not is_valid:
        logger.warning(f"Sensor validation failure: {errors}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"errors": errors, "message": "Sensor readings outside physical bounds"}
        )

    # 2. Risk inference & Anomaly Evaluation
    result = risk_engine.evaluate(data_dict)
    logger.info(f"Processed reading: pH={reading.ph}, Turb={reading.turbidity} -> Risk={result['risk_score']}% ({result['water_quality']})")
    
    return result
