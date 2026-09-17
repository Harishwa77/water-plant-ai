# ml-service/app/models.py
from pydantic import BaseModel, Field
from typing import List, Optional

class WaterReadingInput(BaseModel):
    ph: float = Field(..., ge=0.0, le=14.0, description="pH value between 0 and 14")
    turbidity: float = Field(..., ge=0.0, description="Turbidity in NTU")
    tds: float = Field(..., ge=0.0, description="Total Dissolved Solids in ppm")
    temperature: float = Field(..., ge=0.0, le=100.0, description="Water temperature in °C")
    chlorine: float = Field(..., ge=0.0, description="Free residual chlorine in mg/L")
    flow_rate: float = Field(..., ge=0.0, description="Treated water flow rate in L/min")
    pump_status: Optional[str] = Field(default="ON", description="Operating status of the main feed pump")
    production_volume: Optional[float] = Field(default=0.0, description="Cumulative production volume in Litres")

class FeatureContribution(BaseModel):
    parameter: str
    impact_score: float
    status: str
    deviation: str

class PredictionOutput(BaseModel):
    prediction: str = Field(..., description="NORMAL or ABNORMAL")
    water_quality: str = Field(..., description="GOOD, WARNING, or CRITICAL")
    risk_score: float = Field(..., description="Composite operational risk score from 0 to 100")
    anomaly: bool = Field(..., description="True if Isolation Forest or Rule Engine detects anomaly")
    confidence: float = Field(..., description="Model prediction confidence percentage (0-100)")
    reason: str = Field(..., description="Root-cause AI explanation of the condition")
    recommendation: str = Field(..., description="Prescriptive action recommendation for plant operators")
    contributing_factors: Optional[List[FeatureContribution]] = None
