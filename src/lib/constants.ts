import { ThresholdConfig, SimulationScenario } from '../types';

export const DEFAULT_PRODUCTION_WEBHOOK_URL = 'https://api.agents.snsihub.ai/webhook/upload';

export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  ph_min: 6.5,
  ph_max: 8.5,
  turbidity_max: 5.0, // NTU (EPA / WHO standard for treated water < 5.0 NTU, optimal < 1.0)
  tds_max: 500, // ppm (mg/L)
  temp_min: 15.0, // °C
  temp_max: 32.0, // °C
  chlorine_min: 0.2, // mg/L (residual disinfectant)
  chlorine_max: 2.0, // mg/L
  flow_rate_min: 500, // L/min
  flow_rate_max: 2000, // L/min
};

export const SIMULATION_SCENARIOS: SimulationScenario[] = [
  {
    id: 'normal',
    name: 'Standard Operational State',
    description: 'All sensors well within optimal parameters. Pumps running, flow stable at 1,200 L/min.',
    iconName: 'CheckCircle2',
    badgeColor: 'emerald',
    data: {
      ph: 7.35,
      turbidity: 1.2,
      tds: 310,
      temperature: 24.5,
      chlorine: 0.85,
      flow_rate: 1200,
      pump_status: 'ON',
      production_volume: 5400,
    },
  },
  {
    id: 'high_turbidity',
    name: 'Clarifier / Filtration Breakthrough',
    description: 'Sudden spike in turbidity (8.6 NTU) indicating filter membrane failure or sediment influx.',
    iconName: 'AlertTriangle',
    badgeColor: 'amber',
    data: {
      ph: 7.2,
      turbidity: 8.6,
      tds: 480,
      temperature: 25.1,
      chlorine: 0.6,
      flow_rate: 1150,
      pump_status: 'ON',
      production_volume: 5800,
    },
  },
  {
    id: 'abnormal_ph',
    name: 'Chemical Dosing Fluctuation (Acidic pH)',
    description: 'pH drops to 5.4 due to coagulant overdosing or neutralization pump failure.',
    iconName: 'Flame',
    badgeColor: 'rose',
    data: {
      ph: 5.4,
      turbidity: 2.2,
      tds: 360,
      temperature: 26.0,
      chlorine: 0.45,
      flow_rate: 1100,
      pump_status: 'ON',
      production_volume: 6100,
    },
  },
  {
    id: 'high_tds',
    name: 'Mineral & Salinity Surge (High TDS)',
    description: 'TDS spikes to 780 ppm, indicating Reverse Osmosis membrane fouling or mineral seepage.',
    iconName: 'Layers',
    badgeColor: 'purple',
    data: {
      ph: 7.8,
      turbidity: 3.1,
      tds: 780,
      temperature: 27.5,
      chlorine: 0.9,
      flow_rate: 980,
      pump_status: 'ON',
      production_volume: 6400,
    },
  },
  {
    id: 'temp_anomaly',
    name: 'Thermal Exchanger Overheat',
    description: 'Water temperature reaches 36.8°C, accelerating bacterial growth risk and reducing chlorine efficacy.',
    iconName: 'Thermometer',
    badgeColor: 'amber',
    data: {
      ph: 7.5,
      turbidity: 2.0,
      tds: 340,
      temperature: 36.8,
      chlorine: 0.3,
      flow_rate: 1250,
      pump_status: 'ON',
      production_volume: 6700,
    },
  },
  {
    id: 'pump_flow_failure',
    name: 'Pump Cavitation & Dry Run',
    description: 'Main feed pump is ON but flow rate drops to 120 L/min indicating valve blockage or pump failure.',
    iconName: 'ZapOff',
    badgeColor: 'rose',
    data: {
      ph: 7.4,
      turbidity: 1.8,
      tds: 330,
      temperature: 28.0,
      chlorine: 0.8,
      flow_rate: 120,
      pump_status: 'ON',
      production_volume: 6900,
    },
  },
  {
    id: 'critical_multi_risk',
    name: 'Critical Multi-Variable Breakdown',
    description: 'Extreme turbidity (12.4 NTU), chlorine depletion (0.05 mg/L), and severe flow loss simultaneously.',
    iconName: 'ShieldAlert',
    badgeColor: 'red',
    data: {
      ph: 9.2,
      turbidity: 12.4,
      tds: 890,
      temperature: 34.2,
      chlorine: 0.05,
      flow_rate: 350,
      pump_status: 'ON',
      production_volume: 7200,
    },
  },
];
