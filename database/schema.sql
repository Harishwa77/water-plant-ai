-- ====================================================================
-- WATER PLANT AI: PostgreSQL / Supabase Production Schema
-- ====================================================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Raw Sensor Telemetry Table
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

-- Fast time-series indexing
CREATE INDEX IF NOT EXISTS idx_water_readings_timestamp ON water_readings(timestamp DESC);

-- 3. AI Predictions, Anomaly Detection & Decision Support Table
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
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at DESC);

-- 4. Plant Incidents & Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reading_id UUID REFERENCES water_readings(id) ON DELETE SET NULL,
    severity VARCHAR(20) NOT NULL, -- 'INFO' | 'WARNING' | 'CRITICAL'
    type VARCHAR(50) NOT NULL, -- 'HIGH_TURBIDITY', 'PH_ANOMALY', etc.
    message TEXT NOT NULL,
    parameter VARCHAR(50),
    value VARCHAR(50),
    threshold VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);

-- 5. Plant Status Table
CREATE TABLE IF NOT EXISTS plant_status (
    id SERIAL PRIMARY KEY,
    status VARCHAR(20) NOT NULL DEFAULT 'ONLINE', -- 'ONLINE' | 'WARNING' | 'CRITICAL' | 'OFFLINE'
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Initial default row
INSERT INTO plant_status (id, status, last_updated)
VALUES (1, 'ONLINE', NOW())
ON CONFLICT (id) DO UPDATE SET last_updated = NOW();
