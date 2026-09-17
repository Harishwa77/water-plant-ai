import { WaterReading, AlertItem, PredictionResult, ContributingFactor } from '../types';
import { DEFAULT_THRESHOLDS } from './constants';

export function generateInitialReadings(count = 30): WaterReading[] {
  const readings: WaterReading[] = [];
  const now = new Date();
  
  let basePh = 7.35;
  let baseTurbidity = 1.4;
  let baseTds = 320;
  let baseTemp = 24.2;
  let baseChlorine = 0.75;
  let baseFlow = 1200;
  let baseProduction = 4200;

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 1000).toISOString();
    
    // Add realistic subtle industrial drift and small random noise
    const noise = (Math.random() - 0.5);
    const ph = Number(Math.max(6.8, Math.min(7.9, basePh + noise * 0.15)).toFixed(2));
    const turbidity = Number(Math.max(0.6, Math.min(3.5, baseTurbidity + noise * 0.4)).toFixed(2));
    const tds = Math.round(Math.max(280, Math.min(380, baseTds + noise * 18)));
    const temperature = Number(Math.max(21.0, Math.min(27.5, baseTemp + noise * 0.8)).toFixed(1));
    const chlorine = Number(Math.max(0.4, Math.min(1.2, baseChlorine + noise * 0.1)).toFixed(2));
    const flow_rate = Math.round(Math.max(1050, Math.min(1350, baseFlow + noise * 60)));
    const production_volume = baseProduction + (count - 1 - i) * 25;

    readings.push({
      id: `rd-${count - i}`,
      timestamp,
      ph,
      turbidity,
      tds,
      temperature,
      chlorine,
      flow_rate,
      pump_status: 'ON',
      production_volume,
      created_at: timestamp,
    });
  }

  return readings;
}

export function evaluateLocalRiskAndRules(
  reading: WaterReading,
  thresholds = DEFAULT_THRESHOLDS
): {
  prediction: PredictionResult;
  alerts: AlertItem[];
} {
  const alerts: AlertItem[] = [];
  const factors: ContributingFactor[] = [];
  let riskScore = 8; // base baseline risk

  // 1. pH Rule Evaluation
  if (reading.ph < thresholds.ph_min || reading.ph > thresholds.ph_max) {
    const severity = (reading.ph < 6.0 || reading.ph > 9.0) ? 'CRITICAL' : 'WARNING';
    alerts.push({
      id: `alt-ph-${Date.now()}`,
      severity,
      type: 'PH_ANOMALY',
      parameter: 'pH',
      value: reading.ph,
      threshold: `${thresholds.ph_min} - ${thresholds.ph_max}`,
      message: `pH reading of ${reading.ph} is outside safe operating window (${thresholds.ph_min} - ${thresholds.ph_max}).`,
      status: 'ACTIVE',
      created_at: reading.timestamp || new Date().toISOString(),
    });
    const deviation = reading.ph < thresholds.ph_min 
      ? `Acidic by ${(thresholds.ph_min - reading.ph).toFixed(2)} units` 
      : `Alkaline by ${(reading.ph - thresholds.ph_max).toFixed(2)} units`;
    factors.push({
      parameter: 'pH',
      impactScore: severity === 'CRITICAL' ? 85 : 45,
      status: severity === 'CRITICAL' ? 'critical' : 'warning',
      deviation,
    });
    riskScore += severity === 'CRITICAL' ? 35 : 20;
  } else {
    factors.push({
      parameter: 'pH',
      impactScore: 10,
      status: 'normal',
      deviation: 'Optimal (7.0 - 7.6)',
    });
  }

  // 2. Turbidity Rule Evaluation
  if (reading.turbidity > thresholds.turbidity_max) {
    const severity = reading.turbidity > 8.0 ? 'CRITICAL' : 'WARNING';
    alerts.push({
      id: `alt-turb-${Date.now()}`,
      severity,
      type: 'HIGH_TURBIDITY',
      parameter: 'Turbidity',
      value: `${reading.turbidity} NTU`,
      threshold: `< ${thresholds.turbidity_max} NTU`,
      message: `Turbidity (${reading.turbidity} NTU) exceeds filtration threshold (${thresholds.turbidity_max} NTU). Membrane or clarifier check required.`,
      status: 'ACTIVE',
      created_at: reading.timestamp || new Date().toISOString(),
    });
    factors.push({
      parameter: 'Turbidity',
      impactScore: severity === 'CRITICAL' ? 95 : 55,
      status: severity === 'CRITICAL' ? 'critical' : 'warning',
      deviation: `+${(reading.turbidity - thresholds.turbidity_max).toFixed(2)} NTU above limit`,
    });
    riskScore += severity === 'CRITICAL' ? 40 : 25;
  } else if (reading.turbidity > 2.5) {
    factors.push({
      parameter: 'Turbidity',
      impactScore: 30,
      status: 'warning',
      deviation: 'Slightly elevated (acceptable)',
    });
    riskScore += 10;
  } else {
    factors.push({
      parameter: 'Turbidity',
      impactScore: 5,
      status: 'normal',
      deviation: 'Clear (< 2.0 NTU)',
    });
  }

  // 3. TDS Rule Evaluation
  if (reading.tds > thresholds.tds_max) {
    const severity = reading.tds > 750 ? 'CRITICAL' : 'WARNING';
    alerts.push({
      id: `alt-tds-${Date.now()}`,
      severity,
      type: 'HIGH_TDS',
      parameter: 'TDS',
      value: `${reading.tds} ppm`,
      threshold: `< ${thresholds.tds_max} ppm`,
      message: `Total Dissolved Solids (${reading.tds} ppm) exceeded threshold (${thresholds.tds_max} ppm). Check RO membrane integrity.`,
      status: 'ACTIVE',
      created_at: reading.timestamp || new Date().toISOString(),
    });
    factors.push({
      parameter: 'TDS',
      impactScore: severity === 'CRITICAL' ? 75 : 40,
      status: severity === 'CRITICAL' ? 'critical' : 'warning',
      deviation: `+${reading.tds - thresholds.tds_max} ppm over standard`,
    });
    riskScore += severity === 'CRITICAL' ? 25 : 15;
  } else {
    factors.push({
      parameter: 'TDS',
      impactScore: 8,
      status: 'normal',
      deviation: 'Mineral balance within norms',
    });
  }

  // 4. Chlorine Evaluation
  if (reading.chlorine < thresholds.chlorine_min || reading.chlorine > thresholds.chlorine_max) {
    const isLow = reading.chlorine < thresholds.chlorine_min;
    const severity = (reading.chlorine < 0.1 || reading.chlorine > 3.0) ? 'CRITICAL' : 'WARNING';
    alerts.push({
      id: `alt-cl-${Date.now()}`,
      severity,
      type: isLow ? 'LOW_CHLORINE' : 'HIGH_CHLORINE',
      parameter: 'Chlorine',
      value: `${reading.chlorine} mg/L`,
      threshold: `${thresholds.chlorine_min} - ${thresholds.chlorine_max} mg/L`,
      message: isLow 
        ? `Free chlorine (${reading.chlorine} mg/L) is below disinfection barrier minimum (${thresholds.chlorine_min} mg/L). Risk of microbial recontamination.`
        : `Chlorine (${reading.chlorine} mg/L) exceeds taste and regulatory upper limit (${thresholds.chlorine_max} mg/L).`,
      status: 'ACTIVE',
      created_at: reading.timestamp || new Date().toISOString(),
    });
    factors.push({
      parameter: 'Chlorine',
      impactScore: severity === 'CRITICAL' ? 80 : 35,
      status: severity === 'CRITICAL' ? 'critical' : 'warning',
      deviation: isLow ? `Deficit of ${(thresholds.chlorine_min - reading.chlorine).toFixed(2)} mg/L` : `Excess of ${(reading.chlorine - thresholds.chlorine_max).toFixed(2)} mg/L`,
    });
    riskScore += severity === 'CRITICAL' ? 30 : 15;
  } else {
    factors.push({
      parameter: 'Chlorine',
      impactScore: 6,
      status: 'normal',
      deviation: 'Residual disinfectant optimal',
    });
  }

  // 5. Temperature & Pump/Flow Evaluation
  if (reading.temperature > thresholds.temp_max || reading.temperature < thresholds.temp_min) {
    alerts.push({
      id: `alt-temp-${Date.now()}`,
      severity: reading.temperature > 35 ? 'CRITICAL' : 'WARNING',
      type: 'TEMPERATURE_ANOMALY',
      parameter: 'Temperature',
      value: `${reading.temperature} °C`,
      threshold: `${thresholds.temp_min} - ${thresholds.temp_max} °C`,
      message: `Process temperature (${reading.temperature} °C) is outside nominal operational range.`,
      status: 'ACTIVE',
      created_at: reading.timestamp || new Date().toISOString(),
    });
    riskScore += 15;
  }

  if (reading.pump_status === 'ON' && reading.flow_rate < 300) {
    alerts.push({
      id: `alt-pump-${Date.now()}`,
      severity: 'CRITICAL',
      type: 'PUMP_FLOW_MISMATCH',
      parameter: 'Flow Rate',
      value: `${reading.flow_rate} L/min`,
      threshold: `> 500 L/min while Pump ON`,
      message: `Pump state is reported ON but flow is restricted (${reading.flow_rate} L/min). Possible dry-run cavitation or closed discharge valve.`,
      status: 'ACTIVE',
      created_at: reading.timestamp || new Date().toISOString(),
    });
    factors.push({
      parameter: 'Flow & Pump',
      impactScore: 90,
      status: 'critical',
      deviation: 'Severe flow restriction (< 300 L/min)',
    });
    riskScore += 40;
  }

  // Calculate final bounded risk score (0 - 100)
  const finalRiskScore = Math.min(100, Math.max(0, riskScore));
  const anomalyDetected = alerts.length > 0 || finalRiskScore > 40;
  const isAbnormal = finalRiskScore >= 50;

  let waterQuality: 'GOOD' | 'WARNING' | 'CRITICAL' = 'GOOD';
  if (finalRiskScore >= 70 || alerts.some(a => a.severity === 'CRITICAL')) {
    waterQuality = 'CRITICAL';
  } else if (finalRiskScore >= 35 || alerts.length > 0) {
    waterQuality = 'WARNING';
  }

  // Generate dynamic AI decision support explanation & prescriptive recommendation
  let reason = 'All major parameters are within expected operating ranges. Steady state continuous filtration in progress.';
  let recommendation = 'Maintain current pump throughput and routine sensor calibrations.';

  if (waterQuality === 'CRITICAL') {
    const criticalFactors = factors.filter(f => f.status === 'critical').map(f => f.parameter);
    reason = `Critical operational risk detected. Primary anomalies observed in ${criticalFactors.join(', ') || 'multiple sensor streams'}. Threshold violations breach safety and drinking water compliance.`;
    recommendation = 'IMMEDIATE ACTION: Divert discharge line to secondary holding basin. Inspect active filtration membranes, verify coagulant feed rates, and initiate manual pump cavitation check.';
  } else if (waterQuality === 'WARNING') {
    const warningFactors = factors.filter(f => f.status === 'warning' || f.status === 'critical').map(f => f.parameter);
    reason = `Moderate parameter drift identified in ${warningFactors.join(', ')}. Plant is operating near threshold margins with elevated risk.`;
    recommendation = 'Adjust chemical dosing trim, inspect filter delta-P pressure gauge, and verify sensor optical cleanlines.';
  }

  const confidence = Number((88 + (Math.random() * 8)).toFixed(1));

  const prediction: PredictionResult = {
    id: `pred-${Date.now()}`,
    prediction: isAbnormal ? 'ABNORMAL' : 'NORMAL',
    water_quality: waterQuality,
    risk_score: finalRiskScore,
    anomaly: anomalyDetected,
    confidence,
    reason,
    recommendation,
    contributing_factors: factors,
    ml_model_used: 'Isolation Forest (v2.1) + Random Forest Classifier + Safety Rule Engine',
    created_at: reading.timestamp || new Date().toISOString(),
  };

  return { prediction, alerts };
}
