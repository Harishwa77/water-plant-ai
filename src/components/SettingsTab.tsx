import React, { useState } from 'react';
import { 
  Settings, 
  Share2, 
  Sliders, 
  RotateCcw, 
  Save, 
  Check, 
  Radio, 
  ShieldCheck, 
  Database, 
  Server,
  Zap
} from 'lucide-react';
import { ThresholdConfig } from '../types';
import { DEFAULT_THRESHOLDS, DEFAULT_PRODUCTION_WEBHOOK_URL } from '../lib/constants';

interface SettingsTabProps {
  thresholds: ThresholdConfig;
  setThresholds: (cfg: ThresholdConfig) => void;
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  onOpenDocs: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  thresholds,
  setThresholds,
  webhookUrl,
  setWebhookUrl,
  onOpenDocs,
}) => {
  const [tempThresholds, setTempThresholds] = useState<ThresholdConfig>(thresholds);
  const [tempWebhook, setTempWebhook] = useState<string>(webhookUrl);
  const [saved, setSaved] = useState(false);
  const [testingPing, setTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setThresholds(tempThresholds);
    setWebhookUrl(tempWebhook);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleResetDefaults = () => {
    setTempThresholds(DEFAULT_THRESHOLDS);
    setTempWebhook(DEFAULT_PRODUCTION_WEBHOOK_URL);
    setThresholds(DEFAULT_THRESHOLDS);
    setWebhookUrl(DEFAULT_PRODUCTION_WEBHOOK_URL);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTestPing = async () => {
    setTestingPing(true);
    setPingResult(null);
    try {
      const res = await fetch(tempWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ping: true, timestamp: new Date().toISOString() }),
      });
      setPingResult(`Received HTTP ${res.status}: ${res.statusText}`);
    } catch (err: any) {
      setPingResult(`Connection test notice: ${err.message || 'Network unreachable'}`);
    } finally {
      setTestingPing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Settings Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0A1124] border border-[#16223B]">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            Plant Operating Thresholds & Integration Settings
          </h2>
          <p className="text-xs text-gray-400">
            Configure dynamic safety boundaries, custom sensor envelopes, and n8n backend endpoints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#060E1E] hover:bg-[#0D172E] border border-[#16223B] text-gray-300 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset EPA/WHO Defaults
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: n8n Production Webhook Routing */}
        <div className="p-5 rounded-2xl bg-[#0A1124] border border-[#16223B] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#16223B]">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-gray-200">
              <Share2 className="w-4 h-4 text-cyan-400" />
              Primary Ingestion Endpoint (n8n Webhook)
            </div>
            <span className="text-[10px] text-cyan-300 font-mono px-2 py-0.5 rounded bg-[#060E1E] border border-cyan-900/60">
              Active Target
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-300">
              Target Ingestion Webhook URL:
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={tempWebhook}
                onChange={(e) => setTempWebhook(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#060E1E] border border-[#16223B] text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                placeholder="https://api.agents.snsihub.ai/webhook/upload"
              />
              <button
                type="button"
                onClick={handleTestPing}
                disabled={testingPing}
                className="px-4 py-2 rounded-xl bg-[#060E1E] hover:bg-[#0D172E] border border-cyan-900/60 text-cyan-300 text-xs font-semibold transition-colors shrink-0 disabled:opacity-50"
              >
                {testingPing ? 'Pinging...' : 'Test Connection'}
              </button>
            </div>
            {pingResult && (
              <p className="text-[11px] font-mono text-gray-400 pt-1">
                Result: <span className="text-gray-200">{pingResult}</span>
              </p>
            )}
            <p className="text-[11px] text-gray-400">
              Default production webhook: <code className="text-cyan-300">https://api.agents.snsihub.ai/webhook/upload</code>. Data sent from this application will flow directly to this endpoint.
            </p>
          </div>
        </div>

        {/* Section 2: Sensor Threshold Configuration Envelopes */}
        <div className="p-5 rounded-2xl bg-[#0A1124] border border-[#16223B] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#16223B]">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-gray-200">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Sensor Safety Limits & Alert Trigger Bands
            </div>
            <span className="text-[10px] text-gray-400 font-mono">
              Industrial Water Standards
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            
            {/* pH Min / Max */}
            <div className="space-y-2 p-3.5 rounded-xl bg-[#060E1E] border border-[#16223B]">
              <span className="font-bold text-gray-200">pH Operating Window:</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400">Min pH</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempThresholds.ph_min}
                    onChange={(e) => setTempThresholds({ ...tempThresholds, ph_min: parseFloat(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0A1124] border border-[#16223B] font-mono text-cyan-300 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400">Max pH</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempThresholds.ph_max}
                    onChange={(e) => setTempThresholds({ ...tempThresholds, ph_max: parseFloat(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0A1124] border border-[#16223B] font-mono text-cyan-300 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Turbidity Max */}
            <div className="space-y-2 p-3.5 rounded-xl bg-[#060E1E] border border-[#16223B]">
              <span className="font-bold text-gray-200">Turbidity Max (NTU):</span>
              <div>
                <label className="text-[10px] text-gray-400">Filtration Threshold</label>
                <input
                  type="number"
                  step="0.1"
                  value={tempThresholds.turbidity_max}
                  onChange={(e) => setTempThresholds({ ...tempThresholds, turbidity_max: parseFloat(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#0A1124] border border-[#16223B] font-mono text-cyan-300 text-xs"
                />
              </div>
            </div>

            {/* TDS Max */}
            <div className="space-y-2 p-3.5 rounded-xl bg-[#060E1E] border border-[#16223B]">
              <span className="font-bold text-gray-200">TDS Max (ppm):</span>
              <div>
                <label className="text-[10px] text-gray-400">Permeate Ceiling</label>
                <input
                  type="number"
                  step="10"
                  value={tempThresholds.tds_max}
                  onChange={(e) => setTempThresholds({ ...tempThresholds, tds_max: parseInt(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#0A1124] border border-[#16223B] font-mono text-purple-300 text-xs"
                />
              </div>
            </div>

            {/* Temperature Min / Max */}
            <div className="space-y-2 p-3.5 rounded-xl bg-[#060E1E] border border-[#16223B]">
              <span className="font-bold text-gray-200">Temperature (°C):</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400">Min Temp</label>
                  <input
                    type="number"
                    step="0.5"
                    value={tempThresholds.temp_min}
                    onChange={(e) => setTempThresholds({ ...tempThresholds, temp_min: parseFloat(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0A1124] border border-[#16223B] font-mono text-amber-300 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400">Max Temp</label>
                  <input
                    type="number"
                    step="0.5"
                    value={tempThresholds.temp_max}
                    onChange={(e) => setTempThresholds({ ...tempThresholds, temp_max: parseFloat(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0A1124] border border-[#16223B] font-mono text-amber-300 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Chlorine Min / Max */}
            <div className="space-y-2 p-3.5 rounded-xl bg-[#060E1E] border border-[#16223B]">
              <span className="font-bold text-gray-200">Chlorine (mg/L):</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400">Min Chlorine</label>
                  <input
                    type="number"
                    step="0.05"
                    value={tempThresholds.chlorine_min}
                    onChange={(e) => setTempThresholds({ ...tempThresholds, chlorine_min: parseFloat(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0A1124] border border-[#16223B] font-mono text-emerald-300 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400">Max Chlorine</label>
                  <input
                    type="number"
                    step="0.05"
                    value={tempThresholds.chlorine_max}
                    onChange={(e) => setTempThresholds({ ...tempThresholds, chlorine_max: parseFloat(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0A1124] border border-[#16223B] font-mono text-emerald-300 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Flow Rate Min / Max */}
            <div className="space-y-2 p-3.5 rounded-xl bg-[#060E1E] border border-[#16223B]">
              <span className="font-bold text-gray-200">Flow Rate (L/min):</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400">Min Flow</label>
                  <input
                    type="number"
                    step="50"
                    value={tempThresholds.flow_rate_min}
                    onChange={(e) => setTempThresholds({ ...tempThresholds, flow_rate_min: parseInt(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0A1124] border border-[#16223B] font-mono text-cyan-300 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400">Max Flow</label>
                  <input
                    type="number"
                    step="50"
                    value={tempThresholds.flow_rate_max}
                    onChange={(e) => setTempThresholds({ ...tempThresholds, flow_rate_max: parseInt(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0A1124] border border-[#16223B] font-mono text-cyan-300 text-xs"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Save & Status Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-gray-400">
            {saved ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Check className="w-4 h-4" /> Threshold configurations saved successfully!
              </span>
            ) : (
              <span>Changes take effect immediately across all dashboard telemetry.</span>
            )}
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-900/30 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </div>

      </form>

    </div>
  );
};
