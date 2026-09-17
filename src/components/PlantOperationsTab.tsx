import React, { useState } from 'react';
import { 
  Send, 
  Sparkles, 
  Code2, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Sliders, 
  RefreshCw, 
  Layers, 
  Zap, 
  Clock, 
  ShieldAlert,
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';
import { 
  WaterReading, 
  N8nIngestionResponse, 
  SimulationScenario, 
  ThresholdConfig 
} from '../types';
import { SIMULATION_SCENARIOS } from '../lib/constants';

interface PlantOperationsTabProps {
  webhookUrl: string;
  onSendReading: (reading: WaterReading) => Promise<N8nIngestionResponse>;
  lastIngestionResponse: N8nIngestionResponse | null;
  isIngesting: boolean;
  thresholds: ThresholdConfig;
}

export const PlantOperationsTab: React.FC<PlantOperationsTabProps> = ({
  webhookUrl,
  onSendReading,
  lastIngestionResponse,
  isIngesting,
  thresholds,
}) => {
  const [formData, setFormData] = useState<Omit<WaterReading, 'id'>>({
    timestamp: new Date().toISOString(),
    ph: 7.4,
    turbidity: 2.1,
    tds: 320,
    temperature: 28.0,
    chlorine: 0.5,
    flow_rate: 1200,
    pump_status: 'ON',
    production_volume: 5000,
  });

  const [copied, setCopied] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('normal');

  const handleScenarioSelect = (scenario: SimulationScenario) => {
    setSelectedScenarioId(scenario.id);
    setFormData({
      timestamp: new Date().toISOString(),
      ph: scenario.data.ph,
      turbidity: scenario.data.turbidity,
      tds: scenario.data.tds,
      temperature: scenario.data.temperature,
      chlorine: scenario.data.chlorine,
      flow_rate: scenario.data.flow_rate,
      pump_status: scenario.data.pump_status,
      production_volume: scenario.data.production_volume,
    });
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      timestamp: new Date().toISOString(),
    }));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const readingToSend: WaterReading = {
      ...formData,
      timestamp: new Date().toISOString(),
    };
    await onSendReading(readingToSend);
  };

  const copyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(formData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Sandbox Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0A1124] border border-[#16223B]">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            Interactive Plant Ingestion & Webhook Sandbox
          </h2>
          <p className="text-xs text-gray-400">
            Dispatch synthetic or manual operational readings directly to the production n8n webhook:
          </p>
          <div className="mt-1.5 inline-block font-mono text-[11px] text-cyan-300 bg-[#060E1E] px-2.5 py-1 rounded-md border border-[#16223B]">
            POST {webhookUrl}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleScenarioSelect(SIMULATION_SCENARIOS[0])}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#060E1E] hover:bg-[#0D172E] border border-[#16223B] text-gray-300 text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Nominal
          </button>
        </div>
      </div>

      {/* Scenarios Quick Load */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
          Load Operational Scenario:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {SIMULATION_SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => handleScenarioSelect(s)}
              className={`p-2.5 rounded-xl text-left border transition-all text-xs flex flex-col justify-between space-y-1 ${
                selectedScenarioId === s.id
                  ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200'
                  : 'bg-[#0A1124] border-[#16223B] text-gray-400 hover:text-gray-200 hover:bg-[#0D172E]'
              }`}
            >
              <span className="font-bold truncate text-[11px]">{s.name}</span>
              <span className="text-[10px] text-gray-400 truncate">
                pH {s.data.ph} | {s.data.turbidity} NTU
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Form Sliders (Left) vs JSON Inspector & n8n Roundtrip (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Form Sliders (7 cols) */}
        <form onSubmit={handleSend} className="lg:col-span-7 p-5 rounded-2xl bg-[#0A1124] border border-[#16223B] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#16223B]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">
              Sensor Parameter Tuning
            </h3>
            <span className="text-[11px] text-gray-400 font-mono">
              Adjust Values in Real-time
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            {/* 1. pH */}
            <div className="space-y-1.5 p-3 rounded-xl bg-[#060E1E] border border-[#16223B]">
              <div className="flex justify-between font-medium">
                <span className="text-gray-300">pH Level:</span>
                <span className="font-mono font-bold text-cyan-300">{formData.ph} pH</span>
              </div>
              <input
                type="range"
                min="4.0"
                max="11.0"
                step="0.05"
                value={formData.ph}
                onChange={(e) => handleInputChange('ph', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>4.0 (Acidic)</span>
                <span>Safe: {thresholds.ph_min}-{thresholds.ph_max}</span>
                <span>11.0 (Alkaline)</span>
              </div>
            </div>

            {/* 2. Turbidity */}
            <div className="space-y-1.5 p-3 rounded-xl bg-[#060E1E] border border-[#16223B]">
              <div className="flex justify-between font-medium">
                <span className="text-gray-300">Turbidity:</span>
                <span className="font-mono font-bold text-cyan-300">{formData.turbidity} NTU</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="20.0"
                step="0.1"
                value={formData.turbidity}
                onChange={(e) => handleInputChange('turbidity', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>0.1 (Crystal)</span>
                <span>Limit: &lt; {thresholds.turbidity_max} NTU</span>
                <span>20.0 (Muddy)</span>
              </div>
            </div>

            {/* 3. TDS */}
            <div className="space-y-1.5 p-3 rounded-xl bg-[#060E1E] border border-[#16223B]">
              <div className="flex justify-between font-medium">
                <span className="text-gray-300">Total Dissolved Solids:</span>
                <span className="font-mono font-bold text-purple-300">{formData.tds} ppm</span>
              </div>
              <input
                type="range"
                min="50"
                max="1200"
                step="10"
                value={formData.tds}
                onChange={(e) => handleInputChange('tds', parseInt(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>50 ppm</span>
                <span>Standard: &lt; {thresholds.tds_max}</span>
                <span>1200 ppm</span>
              </div>
            </div>

            {/* 4. Temperature */}
            <div className="space-y-1.5 p-3 rounded-xl bg-[#060E1E] border border-[#16223B]">
              <div className="flex justify-between font-medium">
                <span className="text-gray-300">Process Temperature:</span>
                <span className="font-mono font-bold text-amber-300">{formData.temperature} °C</span>
              </div>
              <input
                type="range"
                min="10"
                max="45"
                step="0.5"
                value={formData.temperature}
                onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>10 °C</span>
                <span>Safe: {thresholds.temp_min}-{thresholds.temp_max}°C</span>
                <span>45 °C</span>
              </div>
            </div>

            {/* 5. Chlorine */}
            <div className="space-y-1.5 p-3 rounded-xl bg-[#060E1E] border border-[#16223B]">
              <div className="flex justify-between font-medium">
                <span className="text-gray-300">Free Chlorine:</span>
                <span className="font-mono font-bold text-emerald-300">{formData.chlorine} mg/L</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="4.0"
                step="0.05"
                value={formData.chlorine}
                onChange={(e) => handleInputChange('chlorine', parseFloat(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>0.0 mg/L</span>
                <span>Target: {thresholds.chlorine_min}-{thresholds.chlorine_max}</span>
                <span>4.0 mg/L</span>
              </div>
            </div>

            {/* 6. Flow Rate */}
            <div className="space-y-1.5 p-3 rounded-xl bg-[#060E1E] border border-[#16223B]">
              <div className="flex justify-between font-medium">
                <span className="text-gray-300">Treated Flow Rate:</span>
                <span className="font-mono font-bold text-cyan-300">{formData.flow_rate} L/min</span>
              </div>
              <input
                type="range"
                min="0"
                max="2500"
                step="50"
                value={formData.flow_rate}
                onChange={(e) => handleInputChange('flow_rate', parseInt(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>0 L/min</span>
                <span>Nominal: {thresholds.flow_rate_min}-{thresholds.flow_rate_max}</span>
                <span>2500 L/min</span>
              </div>
            </div>

            {/* 7. Pump Status */}
            <div className="space-y-1.5 p-3 rounded-xl bg-[#060E1E] border border-[#16223B]">
              <span className="text-gray-300 font-medium">Feed Pump Power:</span>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleInputChange('pump_status', 'ON')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                    formData.pump_status === 'ON'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-[#060E1E] text-gray-400 border border-[#16223B]'
                  }`}
                >
                  PUMP ON
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('pump_status', 'OFF')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                    formData.pump_status === 'OFF'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-[#060E1E] text-gray-400 border border-[#16223B]'
                  }`}
                >
                  PUMP OFF
                </button>
              </div>
            </div>

            {/* 8. Production Volume */}
            <div className="space-y-1.5 p-3 rounded-xl bg-[#060E1E] border border-[#16223B]">
              <div className="flex justify-between font-medium">
                <span className="text-gray-300">Production Volume:</span>
                <span className="font-mono font-bold text-gray-200">{formData.production_volume} L</span>
              </div>
              <input
                type="number"
                value={formData.production_volume}
                onChange={(e) => handleInputChange('production_volume', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-lg bg-[#060E1E] border border-[#16223B] text-gray-200 font-mono"
              />
            </div>

          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={isIngesting}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-500 hover:from-cyan-500 hover:to-blue-400 text-white font-bold text-sm shadow-lg shadow-cyan-900/40 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
          >
            <Send className={`w-4 h-4 ${isIngesting ? 'animate-bounce' : ''}`} />
            <span>{isIngesting ? 'Transmitting to Production n8n...' : 'Send Test Reading to n8n Webhook'}</span>
          </button>
        </form>

        {/* JSON Inspector & n8n Roundtrip Response (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Outgoing JSON Payload Box */}
          <div className="p-4 rounded-2xl bg-[#0A1124] border border-[#16223B] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-gray-300">
                <Code2 className="w-4 h-4 text-cyan-400" />
                Outgoing Webhook JSON
              </div>
              <button
                onClick={copyPayload}
                className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-200"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            
            <pre className="p-3 rounded-xl bg-[#060E1E] border border-[#16223B] text-[11px] font-mono text-cyan-300/90 overflow-x-auto max-h-48">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>

          {/* Last Response Inspector */}
          <div className="p-4 rounded-2xl bg-[#0A1124] border border-[#16223B] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-gray-300">
                <Terminal className="w-4 h-4 text-purple-400" />
                n8n Pipeline Response Inspector
              </div>
              {lastIngestionResponse && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  lastIngestionResponse.success
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {lastIngestionResponse.success ? '200 OK' : 'FALLBACK'}
                </span>
              )}
            </div>

            {lastIngestionResponse ? (
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-[#060E1E] border border-[#16223B] text-[11px] font-mono text-gray-300 leading-tight">
                  <div className="text-cyan-400 font-bold mb-1">Status:</div>
                  <div>{lastIngestionResponse.message}</div>
                </div>

                <div className="p-3 rounded-xl bg-[#060E1E] border border-[#16223B] text-[10px] font-mono text-purple-200 overflow-x-auto max-h-48">
                  {JSON.stringify(lastIngestionResponse.raw_response || lastIngestionResponse, null, 2)}
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-[#060E1E] border border-[#16223B] text-center text-xs text-gray-400 space-y-1">
                <Clock className="w-6 h-6 text-gray-400 mx-auto" />
                <div>Awaiting first test dispatch</div>
                <div className="text-[10px]">Click "Send Test Reading" to trigger the webhook.</div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
