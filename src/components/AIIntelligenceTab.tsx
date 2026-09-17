import React from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Cpu, 
  Layers, 
  Binary, 
  HelpCircle,
  FileCheck2,
  ListChecks,
  Activity
} from 'lucide-react';
import { PredictionResult, WaterReading, ThresholdConfig } from '../types';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';

interface AIIntelligenceTabProps {
  prediction: PredictionResult;
  currentReading: WaterReading;
  thresholds: ThresholdConfig;
  onOpenDocs: () => void;
}

export const AIIntelligenceTab: React.FC<AIIntelligenceTabProps> = ({
  prediction,
  currentReading,
  thresholds,
  onOpenDocs,
}) => {
  // Bar chart data for feature contributions / parameter risk weights
  const factorData = React.useMemo(() => {
    if (prediction.contributing_factors && prediction.contributing_factors.length > 0) {
      return prediction.contributing_factors.map(f => ({
        name: f.parameter,
        impact: f.impactScore,
        status: f.status,
        deviation: f.deviation,
      }));
    }

    // Default factors if not populated
    return [
      { name: 'pH', impact: 15, status: 'normal', deviation: 'Optimal (7.35)' },
      { name: 'Turbidity', impact: 20, status: 'normal', deviation: 'Clear (1.2 NTU)' },
      { name: 'TDS', impact: 10, status: 'normal', deviation: '310 ppm' },
      { name: 'Temperature', impact: 12, status: 'normal', deviation: '24.5 °C' },
      { name: 'Chlorine', impact: 18, status: 'normal', deviation: '0.85 mg/L' },
      { name: 'Flow & Pump', impact: 8, status: 'normal', deviation: '1200 L/min' },
    ];
  }, [prediction]);

  const getRiskColor = (score: number) => {
    if (score >= 81) return { text: 'text-rose-400', bg: 'bg-rose-500', border: 'border-rose-500/40', badge: 'bg-rose-500/20 text-rose-300', level: 'CRITICAL RISK' };
    if (score >= 61) return { text: 'text-orange-400', bg: 'bg-orange-500', border: 'border-orange-500/40', badge: 'bg-orange-500/20 text-orange-300', level: 'HIGH RISK' };
    if (score >= 31) return { text: 'text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500/40', badge: 'bg-amber-500/20 text-amber-300', level: 'MEDIUM RISK' };
    return { text: 'text-cyan-400', bg: 'bg-cyan-500', border: 'border-cyan-500/40', badge: 'bg-cyan-500/20 text-cyan-300', level: 'LOW RISK' };
  };

  const riskStyle = getRiskColor(prediction.risk_score);

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Hybrid ML & Rule Risk Engine Overview */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#0A1124] border border-[#16223B] backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <BrainCircuit className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Intelligent Decision Support & Predictive Risk Engine
                </h2>
                <p className="text-xs text-gray-400">
                  Dual-tier architecture combining <strong>Unsupervised Isolation Forest</strong>, <strong>Random Forest Classifier</strong>, and <strong>Deterministic Safety Bounds</strong>.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${riskStyle.badge}`}>
                {riskStyle.level} ({prediction.risk_score}%)
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-[#060E1E] text-gray-300 border border-[#16223B]">
                Quality: <strong className={prediction.water_quality === 'GOOD' ? 'text-emerald-400' : 'text-amber-400'}>{prediction.water_quality}</strong>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-[#060E1E] text-gray-300 border border-[#16223B]">
                Status: <strong className={prediction.prediction === 'NORMAL' ? 'text-cyan-400' : 'text-rose-400'}>{prediction.prediction}</strong>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-[#060E1E] text-gray-300 border border-[#16223B]">
                Confidence: <strong className="text-white">{prediction.confidence}%</strong>
              </span>
            </div>
          </div>

          {/* Model Status Card */}
          <div className="p-4 rounded-2xl bg-[#060E1E] border border-[#16223B] text-xs space-y-2 min-w-[240px]">
            <div className="flex items-center justify-between text-gray-400 font-medium">
              <span>ML Inference Engine:</span>
              <span className="text-cyan-400 font-mono">FastAPI Python</span>
            </div>
            <div className="flex items-center justify-between text-gray-400 font-medium">
              <span>Anomaly Detection:</span>
              <span className="text-gray-200 font-mono">Isolation Forest</span>
            </div>
            <div className="flex items-center justify-between text-gray-400 font-medium">
              <span>Explanation Layer:</span>
              <span className="text-purple-300 font-mono">Gemini GenAI</span>
            </div>
            <div className="pt-1 border-t border-[#16223B] text-[11px] text-gray-400 flex items-center justify-between">
              <span>Inference Time:</span>
              <span className="font-mono text-emerald-400">&lt; 28 ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: AI Reasoning & Contributing Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: AI Explanation & Operator Prescription */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Root Cause Diagnostic Card */}
          <div className="p-5 rounded-2xl bg-[#0A1124] border border-[#16223B] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">
                  AI Root Cause Diagnostic
                </h3>
              </div>
              <span className="text-[10px] text-gray-400 font-mono">
                Context-Grounded Analysis
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#060E1E] border border-[#16223B] text-sm leading-relaxed text-gray-200 font-medium">
              {prediction.reason}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                <ListChecks className="w-4 h-4 text-cyan-400" />
                Operator Action Recommendation:
              </div>
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-xs leading-relaxed text-cyan-100 font-mono">
                {prediction.recommendation}
              </div>
            </div>
          </div>

          {/* Contributing Parameters Breakdown Chart */}
          <div className="p-5 rounded-2xl bg-[#0A1124] border border-[#16223B] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">
                  Feature Importance & Parameter Anomaly Weights
                </h3>
              </div>
              <span className="text-[11px] text-gray-400 font-mono">
                Relative Impact (0 - 100)
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={factorData} layout="vertical" margin={{ top: 5, right: 20, left: 35, bottom: 5 }}>
                  <XAxis type="number" domain={[0, 100]} stroke="#475569" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#060E1E', borderColor: '#16223B', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(value: any, name: any, item: any) => [`Impact: ${value}/100 (${item.payload.deviation})`, 'Anomaly Weight']}
                  />
                  <Bar dataKey="impact" radius={[0, 6, 6, 0]}>
                    {factorData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.status === 'critical' ? '#f43f5e' : entry.status === 'warning' ? '#f59e0b' : '#06b6d4'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right 1 Col: Mathematical Risk Engine Architecture */}
        <div className="p-5 rounded-2xl bg-[#0A1124] border border-[#16223B] space-y-4">
          <div className="flex items-center gap-2">
            <Binary className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">
              Risk Engine Mathematical Model
            </h3>
          </div>

          <div className="p-3.5 rounded-xl bg-[#060E1E] border border-[#16223B] text-[11px] font-mono text-cyan-300 space-y-1">
            <div className="text-gray-400 text-[10px]"># Composite Risk Formulation</div>
            <div>Risk = w₁·RuleScore + w₂·ML_Anomaly + w₃·QualityScore</div>
            <div className="text-gray-400 text-[10px] pt-1"># Weights: w₁=0.45, w₂=0.35, w₃=0.20</div>
          </div>

          <div className="space-y-3 text-xs text-gray-300">
            <div className="p-3 rounded-xl bg-[#060E1E] border border-[#16223B] space-y-1">
              <div className="font-bold text-cyan-400">1. Rule-Based Safety Tier (w₁ = 0.45)</div>
              <p className="text-[11px] text-gray-400">
                Immediate deterministic checks against EPA/WHO operating envelopes (pH 6.5–8.5, Turbidity &lt; 5.0 NTU, TDS &lt; 500 ppm).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#060E1E] border border-[#16223B] space-y-1">
              <div className="font-bold text-purple-400">2. Isolation Forest (w₂ = 0.35)</div>
              <p className="text-[11px] text-gray-400">
                Unsupervised anomaly isolation detects complex multi-variable drift patterns even when individual sensors appear near nominal.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#060E1E] border border-[#16223B] space-y-1">
              <div className="font-bold text-emerald-400">3. Random Forest Classifier (w₃ = 0.20)</div>
              <p className="text-[11px] text-gray-400">
                Supervised multi-class estimator predicting discrete water quality indices (GOOD, WARNING, CRITICAL).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#060E1E] border border-[#16223B] space-y-1">
              <div className="font-bold text-blue-400">4. Gemini AI Explanation Layer</div>
              <p className="text-[11px] text-gray-400">
                Converts raw probability vectors and threshold violations into structured, actionable operator language.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenDocs}
            className="w-full py-2.5 px-3 rounded-xl bg-[#060E1E] hover:bg-[#0D172E] border border-cyan-900/60 text-cyan-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            Inspect Python ML Source Code
          </button>
        </div>

      </div>

    </div>
  );
};
