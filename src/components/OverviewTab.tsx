import React from 'react';
import { 
  Activity, 
  Droplets, 
  Layers, 
  Thermometer, 
  FlaskConical, 
  Wind, 
  Zap, 
  PackageCheck,
  BrainCircuit, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  Play
} from 'lucide-react';
import { 
  WaterReading, 
  PredictionResult, 
  AlertItem, 
  ThresholdConfig, 
  SimulationScenario 
} from '../types';
import { MetricCard } from './MetricCard';
import { SIMULATION_SCENARIOS } from '../lib/constants';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';

interface OverviewTabProps {
  currentReading: WaterReading;
  prediction: PredictionResult;
  alerts: AlertItem[];
  historicalReadings: WaterReading[];
  thresholds: ThresholdConfig;
  onSelectScenario: (scenario: SimulationScenario) => void;
  onNavigateTab: (tab: any) => void;
  onAcknowledgeAlert: (id: string) => void;
  isIngesting: boolean;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  currentReading,
  prediction,
  alerts,
  historicalReadings,
  thresholds,
  onSelectScenario,
  onNavigateTab,
  onAcknowledgeAlert,
  isIngesting,
}) => {
  // Helper to determine status for metric cards
  const getPhStatus = () => {
    if (currentReading.ph < thresholds.ph_min || currentReading.ph > thresholds.ph_max) {
      return (currentReading.ph < 6.0 || currentReading.ph > 9.0) ? 'critical' : 'warning';
    }
    return 'normal';
  };

  const getTurbidityStatus = () => {
    if (currentReading.turbidity > thresholds.turbidity_max) {
      return currentReading.turbidity > 8.0 ? 'critical' : 'warning';
    }
    return 'normal';
  };

  const getTdsStatus = () => {
    if (currentReading.tds > thresholds.tds_max) {
      return currentReading.tds > 750 ? 'critical' : 'warning';
    }
    return 'normal';
  };

  const getTempStatus = () => {
    if (currentReading.temperature < thresholds.temp_min || currentReading.temperature > thresholds.temp_max) {
      return currentReading.temperature > 35 ? 'critical' : 'warning';
    }
    return 'normal';
  };

  const getChlorineStatus = () => {
    if (currentReading.chlorine < thresholds.chlorine_min || currentReading.chlorine > thresholds.chlorine_max) {
      return (currentReading.chlorine < 0.1 || currentReading.chlorine > 3.0) ? 'critical' : 'warning';
    }
    return 'normal';
  };

  const getFlowStatus = () => {
    if (currentReading.pump_status === 'ON' && currentReading.flow_rate < 300) {
      return 'critical';
    }
    if (currentReading.flow_rate < thresholds.flow_rate_min || currentReading.flow_rate > thresholds.flow_rate_max) {
      return 'warning';
    }
    return 'normal';
  };

  // Sparkline data preparation
  const chartData = React.useMemo(() => {
    return historicalReadings.slice(-15).map((r, index) => ({
      time: index,
      turbidity: r.turbidity,
      ph: r.ph,
      tds: r.tds,
      flow: r.flow_rate,
    }));
  }, [historicalReadings]);

  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      
      {/* Top Banner: AI Plant Health & Quick Decision Brief */}
      <div className={`relative overflow-hidden rounded-3xl p-5 sm:p-6 border backdrop-blur-xl transition-all ${
        prediction.water_quality === 'CRITICAL'
          ? 'bg-rose-950/40 border-rose-500/40 shadow-[0_0_30px_rgba(244,63,94,0.15)]'
          : prediction.water_quality === 'WARNING'
            ? 'bg-amber-950/30 border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.15)]'
            : 'bg-[#0A1124] border-[#16223B] shadow-[0_0_30px_rgba(6,182,212,0.1)]'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Status & Water Quality Indicator */}
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest border ${
                prediction.water_quality === 'CRITICAL'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : prediction.water_quality === 'WARNING'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                WATER QUALITY: {prediction.water_quality}
              </span>

              <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono border ${
                prediction.anomaly
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse'
                  : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
              }`}>
                {prediction.anomaly ? '⚠ ANOMALY DETECTED' : '✓ NO ANOMALIES'}
              </span>

              <span className="text-xs text-gray-400 font-mono">
                Model Confidence: <strong className="text-gray-200">{prediction.confidence}%</strong>
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {prediction.reason}
            </h2>

            <div className="flex items-start gap-2 pt-1 text-xs sm:text-sm text-cyan-200/90 font-medium">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>Action Recommendation:</strong> {prediction.recommendation}
              </span>
            </div>
          </div>

          {/* Risk Score Dial Card */}
          <div className="shrink-0 flex items-center gap-4 p-4 rounded-2xl bg-[#060E1E] border border-[#16223B]">
            <div className="relative flex items-center justify-center w-20 h-20">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                <path
                  className="text-gray-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={
                    prediction.risk_score > 70 
                      ? 'text-rose-500' 
                      : prediction.risk_score > 35 
                        ? 'text-amber-500' 
                        : 'text-cyan-400'
                  }
                  strokeDasharray={`${prediction.risk_score}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-lg font-black font-mono tracking-tighter text-white">
                  {prediction.risk_score}%
                </span>
                <span className="text-[9px] uppercase font-bold text-gray-400">Risk</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="font-bold text-gray-200">Risk Assessment</div>
              <div className="text-[11px] text-gray-400">
                Classification: <strong className={
                  prediction.risk_score > 70 ? 'text-rose-400' : prediction.risk_score > 35 ? 'text-amber-400' : 'text-emerald-400'
                }>{prediction.prediction}</strong>
              </div>
              <button
                onClick={() => onNavigateTab('ai_intelligence')}
                className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors pt-1"
              >
                Inspect ML Breakdown <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 8 Core Industrial Parameter Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">
              Live Sensor Telemetry
            </h3>
            <span className="text-xs text-gray-400">
              (Ingested via n8n Production Webhook)
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('live_monitoring')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            Full Multi-Sensor Charts <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. pH Sensor */}
          <MetricCard
            id="metric-ph"
            title="pH Value"
            value={currentReading.ph}
            unit="pH"
            icon={FlaskConical}
            status={getPhStatus()}
            thresholdText={`${thresholds.ph_min} - ${thresholds.ph_max}`}
            trend={{ direction: currentReading.ph > 7.4 ? 'up' : 'stable', changeText: `${currentReading.ph} pH` }}
          />

          {/* 2. Turbidity Sensor */}
          <MetricCard
            id="metric-turbidity"
            title="Turbidity"
            value={currentReading.turbidity}
            unit="NTU"
            icon={Droplets}
            status={getTurbidityStatus()}
            thresholdText={`< ${thresholds.turbidity_max} NTU`}
            trend={{ 
              direction: currentReading.turbidity > 3.0 ? 'up' : 'down', 
              changeText: `${currentReading.turbidity} NTU` 
            }}
          />

          {/* 3. TDS Sensor */}
          <MetricCard
            id="metric-tds"
            title="Total Dissolved Solids"
            value={currentReading.tds}
            unit="ppm"
            icon={Layers}
            status={getTdsStatus()}
            thresholdText={`< ${thresholds.tds_max} ppm`}
            trend={{ direction: 'stable', changeText: 'Stable' }}
          />

          {/* 4. Temperature Sensor */}
          <MetricCard
            id="metric-temperature"
            title="Process Temperature"
            value={currentReading.temperature}
            unit="°C"
            icon={Thermometer}
            status={getTempStatus()}
            thresholdText={`${thresholds.temp_min} - ${thresholds.temp_max} °C`}
            trend={{ direction: currentReading.temperature > 26 ? 'up' : 'stable', changeText: `${currentReading.temperature}°C` }}
          />

          {/* 5. Free Chlorine Sensor */}
          <MetricCard
            id="metric-chlorine"
            title="Free Chlorine"
            value={currentReading.chlorine}
            unit="mg/L"
            icon={Activity}
            status={getChlorineStatus()}
            thresholdText={`${thresholds.chlorine_min} - ${thresholds.chlorine_max} mg/L`}
            trend={{ direction: currentReading.chlorine < 0.3 ? 'down' : 'stable', changeText: 'Residual' }}
          />

          {/* 6. Flow Rate */}
          <MetricCard
            id="metric-flow"
            title="Treated Flow Rate"
            value={currentReading.flow_rate}
            unit="L/min"
            icon={Wind}
            status={getFlowStatus()}
            thresholdText={`${thresholds.flow_rate_min} - ${thresholds.flow_rate_max} L/min`}
            trend={{ direction: currentReading.flow_rate > 1000 ? 'up' : 'down', changeText: `${currentReading.flow_rate} L/m` }}
          />

          {/* 7. Pump Status */}
          <MetricCard
            id="metric-pump"
            title="Primary Feed Pump"
            value={currentReading.pump_status}
            unit=""
            icon={Zap}
            status={currentReading.pump_status === 'ON' ? (getFlowStatus() === 'critical' ? 'critical' : 'normal') : 'warning'}
            thresholdText="Operational (ON)"
            trend={{ direction: 'stable', changeText: currentReading.pump_status === 'ON' ? 'Running' : 'Standby' }}
          />

          {/* 8. Production Volume */}
          <MetricCard
            id="metric-production"
            title="Daily Production"
            value={currentReading.production_volume}
            unit="Litres"
            icon={PackageCheck}
            status="normal"
            thresholdText="Target 10,000 L"
            trend={{ direction: 'up', changeText: '+25 L/min' }}
          />

        </div>
      </div>

      {/* Quick Scenario Injector Matrix */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0A1124] border border-[#16223B] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300">
              Operational Scenario Simulator
            </h4>
            <p className="text-[11px] text-gray-400">
              Click any scenario to inject real-time multi-sensor conditions into the n8n pipeline:
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('plant_operations')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            Custom Manual Ingestion Sandbox <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
          {SIMULATION_SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => onSelectScenario(scenario)}
              disabled={isIngesting}
              className="flex flex-col text-left p-2.5 rounded-xl bg-[#060E1E] border border-[#16223B] hover:border-cyan-500/40 hover:bg-[#0D172E] transition-all text-xs group disabled:opacity-50"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-semibold text-gray-200 group-hover:text-cyan-300 truncate">
                  {scenario.name.split('(')[0]}
                </span>
                <Play className="w-3 h-3 text-gray-500 group-hover:text-cyan-400 shrink-0" />
              </div>
              <span className="text-[10px] text-gray-400 line-clamp-1">
                pH {scenario.data.ph} | Turb {scenario.data.turbidity}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Grid: Live Trend Previews & Active Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Previews (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0A1124] border border-[#16223B] space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Turbidity & pH Trend Stream
            </h4>
            <span className="text-[11px] text-gray-400 font-mono">Last 15 Cycles</span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="turbidityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="phGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 10 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#060E1E', borderColor: '#16223B', borderRadius: '12px', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="turbidity" 
                  stroke="#22d3ee" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#turbidityGrad)" 
                  name="Turbidity (NTU)"
                />
                <Area 
                  type="monotone" 
                  dataKey="ph" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#phGrad)" 
                  name="pH"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Alerts Panel (1 col) */}
        <div className="p-5 rounded-2xl bg-[#0A1124] border border-[#16223B] flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#16223B]">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  Active Alerts ({activeAlerts.length})
                </h4>
              </div>
              <button
                onClick={() => onNavigateTab('alerts')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
              >
                View Log
              </button>
            </div>

            <div className="mt-3 space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {activeAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  <p className="text-xs font-medium text-gray-300">All Systems Nominal</p>
                  <p className="text-[10px]">No unresolved alerts in the water plant queue.</p>
                </div>
              ) : (
                activeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                        : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {alert.type}
                      </span>
                      <button
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        className="text-[10px] px-2 py-0.5 rounded bg-[#060E1E] hover:bg-[#0D172E] border border-[#16223B] text-gray-300"
                      >
                        Acknowledge
                      </button>
                    </div>
                    <p className="text-[11px] opacity-90 leading-tight">
                      {alert.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[#16223B] text-[11px] text-gray-400 flex items-center justify-between">
            <span>Automated Incident Routing:</span>
            <span className="font-mono text-cyan-300">n8n Rules Active</span>
          </div>
        </div>

      </div>

    </div>
  );
};
