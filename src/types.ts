export type PlantStatusType = 'ONLINE' | 'WARNING' | 'CRITICAL' | 'OFFLINE';

export type WaterQualityType = 'GOOD' | 'WARNING' | 'CRITICAL';

export type PredictionStatusType = 'NORMAL' | 'ABNORMAL';

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface WaterReading {
  id?: string;
  timestamp: string;
  ph: number;
  turbidity: number;
  tds: number;
  temperature: number;
  chlorine: number;
  flow_rate: number;
  pump_status: 'ON' | 'OFF';
  production_volume: number;
  created_at?: string;
}

export interface ContributingFactor {
  parameter: string;
  impactScore: number; // 0 to 100
  status: 'normal' | 'warning' | 'critical';
  deviation: string;
}

export interface PredictionResult {
  id?: string;
  reading_id?: string;
  prediction: PredictionStatusType;
  water_quality: WaterQualityType;
  risk_score: number; // 0 to 100
  anomaly: boolean;
  confidence: number; // 0 to 100 percentage
  reason: string;
  recommendation: string;
  contributing_factors?: ContributingFactor[];
  ml_model_used?: string;
  created_at?: string;
}

export interface AlertItem {
  id: string;
  reading_id?: string;
  severity: AlertSeverity;
  type: string;
  message: string;
  parameter?: string;
  value?: number | string;
  threshold?: string;
  status: AlertStatus;
  created_at: string;
  resolved_at?: string | null;
}

export interface PlantOperationalStatus {
  status: PlantStatusType;
  last_updated: string;
  active_alerts_count: number;
  overall_risk_score: number;
  system_uptime: string;
  total_production_today: number;
  efficiency_rating: number;
}

export interface ThresholdConfig {
  ph_min: number;
  ph_max: number;
  turbidity_max: number;
  tds_max: number;
  temp_min: number;
  temp_max: number;
  chlorine_min: number;
  chlorine_max: number;
  flow_rate_min: number;
  flow_rate_max: number;
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  iconName: string;
  badgeColor: string;
  data: Omit<WaterReading, 'timestamp' | 'id'>;
}

export interface N8nIngestionResponse {
  success: boolean;
  message?: string;
  reading?: WaterReading;
  prediction?: PredictionResult;
  alerts?: AlertItem[];
  recommendation?: string;
  raw_response?: any;
}

export interface DashboardData {
  latest: WaterReading;
  prediction: PredictionResult;
  alerts: AlertItem[];
  trend: WaterReading[];
  status: PlantOperationalStatus;
}
