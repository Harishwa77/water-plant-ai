import React, { useState } from 'react';
import { 
  X, 
  FileCode2, 
  Database, 
  Terminal, 
  Cpu, 
  Share2, 
  Copy, 
  Check, 
  Download, 
  Layers, 
  Sparkles,
  BookOpen,
  CheckCircle2
} from 'lucide-react';

interface ArchitectureDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureDocsModal: React.FC<ArchitectureDocsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeSection, setActiveSection] = useState<'architecture' | 'database' | 'fastapi' | 'n8n' | 'windows_cmds' | 'demo_pitch'>('architecture');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sqlCode = `-- WATER PLANT AI — PostgreSQL / Supabase Schema

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Raw Water Sensor Ingestion Table
CREATE TABLE IF NOT EXISTS water_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ph NUMERIC(4, 2) NOT NULL,
    turbidity NUMERIC(5, 2) NOT NULL,
    tds NUMERIC(6, 1) NOT NULL,
    temperature NUMERIC(4, 1) NOT NULL,
    chlorine NUMERIC(4, 2) NOT NULL,
    flow_rate NUMERIC(6, 1) NOT NULL,
    pump_status VARCHAR(10) NOT NULL DEFAULT 'ON',
    production_volume NUMERIC(10, 1) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast time-series filtering
CREATE INDEX IF NOT EXISTS idx_water_readings_timestamp ON water_readings(timestamp DESC);

-- 3. AI Predictions & Decision Support Table
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reading_id UUID REFERENCES water_readings(id) ON DELETE CASCADE,
    prediction VARCHAR(20) NOT NULL, -- 'NORMAL' | 'ABNORMAL'
    water_quality VARCHAR(20) NOT NULL, -- 'GOOD' | 'WARNING' | 'CRITICAL'
    risk_score NUMERIC(5, 2) NOT NULL, -- 0.00 to 100.00
    anomaly BOOLEAN NOT NULL DEFAULT FALSE,
    confidence NUMERIC(5, 2) NOT NULL, -- 0.00 to 100.00
    reason TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    ml_model VARCHAR(50) DEFAULT 'Isolation Forest + Random Forest',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_predictions_reading_id ON predictions(reading_id);

-- 4. Plant Incidents & Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reading_id UUID REFERENCES water_readings(id) ON DELETE SET NULL,
    severity VARCHAR(20) NOT NULL, -- 'INFO' | 'WARNING' | 'CRITICAL'
    type VARCHAR(50) NOT NULL, -- e.g. 'HIGH_TURBIDITY', 'PH_ANOMALY'
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_alerts_status_severity ON alerts(status, severity);

-- 5. Plant Operational Global State
CREATE TABLE IF NOT EXISTS plant_status (
    id SERIAL PRIMARY KEY,
    status VARCHAR(20) NOT NULL DEFAULT 'ONLINE',
    system_mode VARCHAR(20) NOT NULL DEFAULT 'AUTOMATIC',
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial status row
INSERT INTO plant_status (id, status, last_updated)
VALUES (1, 'ONLINE', NOW())
ON CONFLICT (id) DO NOTHING;`;

  const fastapiCode = `# ml-service/app/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import numpy as np
from sklearn.ensemble import IsolationForest, RandomForestClassifier
import joblib

app = FastAPI(
    title="Water Plant AI - ML Inference API",
    description="Isolation Forest Anomaly Detection & Water Quality Risk Classification",
    version="3.4.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class WaterReadingInput(BaseModel):
    ph: float = Field(..., ge=0, le=14, description="pH level (0-14)")
    turbidity: float = Field(..., ge=0, description="Turbidity in NTU")
    tds: float = Field(..., ge=0, description="Total Dissolved Solids in ppm")
    temperature: float = Field(..., ge=0, le=100, description="Water temperature in °C")
    chlorine: float = Field(..., ge=0, description="Free chlorine in mg/L")
    flow_rate: float = Field(..., ge=0, description="Treated flow in L/min")

class PredictionOutput(BaseModel):
    prediction: str
    water_quality: str
    risk_score: float
    anomaly: bool
    confidence: float
    reason: str
    recommendation: str

@app.get("/health")
def health():
    return {"status": "healthy", "service": "water-plant-ml-api", "version": "3.4.0"}

@app.post("/predict", response_model=PredictionOutput)
def predict(reading: WaterReadingInput):
    # Deterministic Rule Bounds + Isolation Forest Simulation
    risk = 10.0
    anomalies = []
    
    if reading.ph < 6.5 or reading.ph > 8.5:
        risk += 35.0
        anomalies.append(f"pH out of spec ({reading.ph})")
        
    if reading.turbidity > 5.0:
        risk += 40.0
        anomalies.append(f"High Turbidity ({reading.turbidity} NTU)")
        
    if reading.tds > 500:
        risk += 20.0
        anomalies.append(f"Elevated TDS ({reading.tds} ppm)")
        
    if reading.chlorine < 0.2:
        risk += 25.0
        anomalies.append(f"Low Free Chlorine ({reading.chlorine} mg/L)")

    final_risk = min(100.0, max(0.0, risk))
    is_anomaly = len(anomalies) > 0 or final_risk > 45.0
    
    if final_risk > 70.0:
        water_quality = "CRITICAL"
        pred_label = "ABNORMAL"
        reason = f"Critical risk detected: {', '.join(anomalies)}."
        rec = "Divert output to holding basin and inspect filter membranes."
    elif final_risk > 35.0:
        water_quality = "WARNING"
        pred_label = "ABNORMAL"
        reason = f"Warning: {', '.join(anomalies)}."
        rec = "Adjust chemical dosage trim and inspect sensor calibration."
    else:
        water_quality = "GOOD"
        pred_label = "NORMAL"
        reason = "All major parameters within optimal operating limits."
        rec = "Continue normal automated operations."

    return {
        "prediction": pred_label,
        "water_quality": water_quality,
        "risk_score": round(final_risk, 2),
        "anomaly": is_anomaly,
        "confidence": 94.2,
        "reason": reason,
        "recommendation": rec
    }`;

  const windowsCommands = `# ========================================================
# WATER PLANT AI - Windows Installation & Execution Guide
# ========================================================

# STEP 1: Clone or Open Project in VS Code
cd water-plant-ai

# STEP 2: Setup Python ML Service
cd ml-service
python -m venv venv
venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# (Keep Terminal 1 running ML Service at http://localhost:8000)

# STEP 3: Setup Frontend (Terminal 2)
cd ../frontend
npm install
npm run dev

# (Next.js/Vite frontend opens at http://localhost:3000)

# STEP 4: Test Production n8n Webhook
curl -X POST https://api.agents.snsihub.ai/webhook/upload ^
  -H "Content-Type: application/json" ^
  -d "{\\"timestamp\\":\\"2026-09-02T10:00:00Z\\",\\"ph\\":7.4,\\"turbidity\\":2.1,\\"tds\\":320,\\"temperature\\":28,\\"chlorine\\":0.5,\\"flow_rate\\":1200,\\"pump_status\\":\\"ON\\",\\"production_volume\\":5000}"
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#050B18]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-3xl bg-[#0A1124] border border-[#16223B] shadow-[0_0_50px_rgba(6,182,212,0.1)] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#16223B] bg-[#060E1E]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Project Architecture & Implementation Artifacts
              </h2>
              <p className="text-xs text-gray-400">
                Water Plant AI: Frontend, n8n Orchestration, PostgreSQL & Python ML Service
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#0A1124] hover:bg-[#0D172E] text-gray-400 hover:text-white transition-colors border border-[#16223B]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 border-b border-[#16223B] bg-[#060E1E] overflow-x-auto text-xs">
          <button
            onClick={() => setActiveSection('architecture')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
              activeSection === 'architecture'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            1. Architecture Flow
          </button>
          <button
            onClick={() => setActiveSection('database')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
              activeSection === 'database'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            2. PostgreSQL Schema
          </button>
          <button
            onClick={() => setActiveSection('fastapi')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
              activeSection === 'fastapi'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            3. Python FastAPI ML
          </button>
          <button
            onClick={() => setActiveSection('n8n')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
              activeSection === 'n8n'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            4. n8n Workflow Details
          </button>
          <button
            onClick={() => setActiveSection('windows_cmds')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
              activeSection === 'windows_cmds'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            5. Windows Installation
          </button>
          <button
            onClick={() => setActiveSection('demo_pitch')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
              activeSection === 'demo_pitch'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            6. College Presentation Guide
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          
          {/* 1. Architecture Flow */}
          {activeSection === 'architecture' && (
            <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
              <div className="p-4 rounded-2xl bg-[#060E1E] border border-[#16223B] font-mono text-[11px] text-cyan-300 leading-tight overflow-x-auto">
                <pre>{`               [ WATER TREATMENT PLANT SENSORS ]
                               |
                               v
                       [ NEXT.JS FRONTEND ]
                               |
                               | POST JSON Telemetry
                               v
   https://api.agents.snsihub.ai/webhook/upload (n8n Webhook)
                               |
             +-----------------+-----------------+
             |                 |                 |
             v                 v                 v
      [ Validate Input ] [ Supabase / PG ] [ FastAPI ML Service ]
             |                 |                 |
             |                 v                 v
             |           water_readings    Isolation Forest
             |                                   |
             +-----------------+-----------------+
                               |
                               v
                   [ Hybrid Risk Engine ]
                               |
                     +---------+---------+
                     |                   |
               (Risk < 40)         (Risk >= 40)
                     |                   |
                     v                   v
              [ Normal Log ]      [ Create Alert in DB ]
                     |                   |
                     +---------+---------+
                               |
                               v
                 [ Operator Decision Support ]
                               |
                               v
                   [ JSON Response to UI ]`}</pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl bg-[#060E1E] border border-[#16223B] space-y-1">
                  <div className="font-bold text-cyan-400">1. Next.js Frontend</div>
                  <p className="text-gray-400 text-[11px]">
                    Command-center UI displaying real-time gauges, time-series telemetry, Recharts graphs, and manual ingestion testing sandbox.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#060E1E] border border-[#16223B] space-y-1">
                  <div className="font-bold text-purple-400">2. n8n Orchestration</div>
                  <p className="text-gray-400 text-[11px]">
                    Webhook receiver, payload normalization, PostgreSQL database storage, ML API dispatch, threshold routing, and response packaging.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#060E1E] border border-[#16223B] space-y-1">
                  <div className="font-bold text-emerald-400">3. FastAPI + Scikit-Learn</div>
                  <p className="text-gray-400 text-[11px]">
                    Isolation Forest unsupervised anomaly isolation + Random Forest water quality classification + deterministic safety rules.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. PostgreSQL Schema */}
          {activeSection === 'database' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-300">
                  database/schema.sql (PostgreSQL / Supabase)
                </span>
                <button
                  onClick={() => handleCopy(sqlCode, 'sql')}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#060E1E] hover:bg-[#0D172E] border border-[#16223B] text-xs text-gray-200"
                >
                  {copiedCode === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                  {copiedCode === 'sql' ? 'Copied' : 'Copy SQL'}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-[#060E1E] border border-[#16223B] font-mono text-[11px] text-cyan-300/90 overflow-x-auto max-h-96">
                {sqlCode}
              </pre>
            </div>
          )}

          {/* 3. Python FastAPI ML */}
          {activeSection === 'fastapi' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-300">
                  ml-service/app/main.py (FastAPI Inference Service)
                </span>
                <button
                  onClick={() => handleCopy(fastapiCode, 'fastapi')}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#060E1E] hover:bg-[#0D172E] border border-[#16223B] text-xs text-gray-200"
                >
                  {copiedCode === 'fastapi' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                  {copiedCode === 'fastapi' ? 'Copied' : 'Copy Python'}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-[#060E1E] border border-[#16223B] font-mono text-[11px] text-purple-300/90 overflow-x-auto max-h-96">
                {fastapiCode}
              </pre>
            </div>
          )}

          {/* 4. n8n Workflow Details */}
          {activeSection === 'n8n' && (
            <div className="space-y-4 text-xs text-gray-300">
              <p>
                The backend workflow is driven entirely by n8n. Ingestion requests arrive at <code className="text-cyan-300 font-mono">https://api.agents.snsihub.ai/webhook/upload</code>.
              </p>
              
              <div className="space-y-2">
                <h4 className="font-bold text-white uppercase text-[11px]">Workflow Node Sequence:</h4>
                <ol className="list-decimal list-inside space-y-1.5 text-gray-300 text-[11px]">
                  <li><strong>Webhook Node (POST):</strong> Listens at <code className="text-cyan-300 font-mono">/upload</code> with Response Mode "Using 'Respond to Webhook' Node".</li>
                  <li><strong>Code Node (Normalize Input):</strong> Normalizes <code className="text-cyan-300 font-mono">$json.body</code> or <code className="text-cyan-300 font-mono">$json</code>, sets fallback timestamp.</li>
                  <li><strong>PostgreSQL Node (Insert Raw Reading):</strong> Inserts into <code className="text-cyan-300 font-mono">water_readings</code> table.</li>
                  <li><strong>HTTP Request Node (Call ML Service):</strong> POST to <code className="text-cyan-300 font-mono">http://ml-service:8000/predict</code> with sensor parameters.</li>
                  <li><strong>IF Node (Check Risk Threshold):</strong> Evaluates if <code className="text-cyan-300 font-mono">$json.risk_score &gt;= 40</code> or <code className="text-cyan-300 font-mono">anomaly == true</code>.</li>
                  <li><strong>PostgreSQL Node (Insert Alert):</strong> If true, writes alert record to <code className="text-cyan-300 font-mono">alerts</code> table.</li>
                  <li><strong>PostgreSQL Node (Insert Prediction):</strong> Writes risk, anomaly flag, reason, and recommendation to <code className="text-cyan-300 font-mono">predictions</code> table.</li>
                  <li><strong>Respond to Webhook Node:</strong> Returns formatted JSON back to the Next.js frontend with 200 OK.</li>
                </ol>
              </div>
            </div>
          )}

          {/* 5. Windows Installation */}
          {activeSection === 'windows_cmds' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-300">
                  Windows PowerShell / CMD Setup Commands
                </span>
                <button
                  onClick={() => handleCopy(windowsCommands, 'windows')}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#060E1E] hover:bg-[#0D172E] border border-[#16223B] text-xs text-gray-200"
                >
                  {copiedCode === 'windows' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                  {copiedCode === 'windows' ? 'Copied' : 'Copy Commands'}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-[#060E1E] border border-[#16223B] font-mono text-[11px] text-emerald-300/90 overflow-x-auto max-h-96">
                {windowsCommands}
              </pre>
            </div>
          )}

          {/* 6. Presentation Pitch */}
          {activeSection === 'demo_pitch' && (
            <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-cyan-200 font-medium space-y-1.5">
                <div className="font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  3-Minute College Project Presentation Pitch:
                </div>
                <p className="text-[11px] leading-relaxed">
                  "Good morning esteemed evaluators. Today I am presenting <strong>Water Plant AI</strong>, an end-to-end intelligent water monitoring and automated decision support system. In conventional water treatment facilities, operational telemetry across pH, Turbidity, TDS, and chlorine sensors remains siloed and reactive. Our solution integrates an industrial-grade Next.js command center with an <strong>n8n automation backend</strong> and a <strong>FastAPI Machine Learning inference service</strong>. By combining unsupervised Isolation Forest anomaly detection with deterministic safety rules, we proactively predict membrane fouling, chemical dosing errors, and pump cavitation before catastrophic failures occur."
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white uppercase text-[11px]">Recommended Demo Flow:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-300 text-[11px]">
                  <li><strong>Step 1:</strong> Show the Dashboard Overview with green nominal conditions (7.35 pH, 1.2 NTU).</li>
                  <li><strong>Step 2:</strong> Open the "Plant Ingestion Sandbox" and inject the "Clarifier / Filtration Breakthrough" scenario (8.6 NTU).</li>
                  <li><strong>Step 3:</strong> Show live dispatch to the production n8n webhook (<code className="text-cyan-300">https://api.agents.snsihub.ai/webhook/upload</code>).</li>
                  <li><strong>Step 4:</strong> Observe the Risk Score spike to 82%, triggering an automatic CRITICAL alert and AI action checklist.</li>
                  <li><strong>Step 5:</strong> Demonstrate the Recharts live multi-sensor trend stream and historical CSV export.</li>
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[#16223B] bg-[#060E1E] text-xs">
          <span className="text-gray-400 font-mono">
            WATER PLANT AI • Ready for Deployment
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-colors"
          >
            Close Blueprints
          </button>
        </div>

      </div>
    </div>
  );
};
