import React from 'react';
import { 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Database, 
  Cpu, 
  Share2, 
  FileCode2, 
  Sparkles 
} from 'lucide-react';
import { PlantStatusType, AlertItem } from '../types';

interface HeaderProps {
  plantStatus: PlantStatusType;
  overallRisk: number;
  activeAlerts: AlertItem[];
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  webhookUrl: string;
  onOpenDocs: () => void;
  onQuickSimulate: () => void;
  isSimulating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  plantStatus,
  overallRisk,
  activeAlerts,
  isDemoMode,
  setIsDemoMode,
  webhookUrl,
  onOpenDocs,
  onQuickSimulate,
  isSimulating,
}) => {
  const [time, setTime] = React.useState<string>('');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = () => {
    switch (plantStatus) {
      case 'ONLINE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            SYSTEM ONLINE
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            ELEVATED RISK
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            CRITICAL INTERVENTION
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/30">
            OFFLINE
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#16223B] bg-[#050B18]/95 backdrop-blur-xl">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between px-4 sm:px-6 py-3 gap-3">
        
        {/* Brand & System Title */}
        <div className="flex items-center justify-between lg:justify-start gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#0A1124] border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-cyan-400 rounded-full border-2 border-[#050B18]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                  WATER PLANT AI
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#0A1124] text-cyan-300 border border-cyan-500/30">
                  v3.4-PROD
                </span>
              </div>
              <p className="text-[11px] text-gray-400 hidden sm:block">
                Intelligent Monitoring, ML Prediction & n8n Decision Support System
              </p>
            </div>
          </div>

          <div className="lg:hidden">
            {getStatusBadge()}
          </div>
        </div>

        {/* Real-time Telemetry Status Bar */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2 sm:gap-3 text-xs">
          
          {/* Status Badge Desktop */}
          <div className="hidden lg:flex items-center gap-2">
            {getStatusBadge()}
          </div>

          {/* Plant Clock */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A1124] border border-[#16223B] text-gray-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{time || '--:--:--'}</span>
            <span className="text-[10px] text-gray-500">UTC</span>
          </div>

          {/* n8n Webhook Target Pill */}
          <div 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A1124] border border-[#16223B] text-gray-300 max-w-[220px] sm:max-w-xs truncate"
            title={`Primary Webhook: ${webhookUrl}`}
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-gray-400 font-mono text-[11px] truncate">
              n8n: <span className="text-cyan-300">api.agents.snsihub.ai</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_6px_#22d3ee]"></span>
          </div>

          {/* Mode Switcher */}
          <button
            onClick={() => setIsDemoMode(!isDemoMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              isDemoMode
                ? 'bg-purple-950/40 text-purple-300 border-purple-800/70 hover:bg-purple-900/50'
                : 'bg-[#0A1124] text-cyan-300 border-cyan-800/60 hover:border-cyan-500/50'
            }`}
            title="Toggle between Live n8n Dispatch and Synthetic Simulation Mode"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{isDemoMode ? 'DEMO DATA' : 'LIVE N8N'}</span>
          </button>

          {/* Quick Trigger Button */}
          <button
            onClick={onQuickSimulate}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-cyan-950/40 transition-all active:scale-95 disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSimulating ? 'Ingesting...' : 'Ingest Sample'}</span>
            <span className="sm:hidden">Ingest</span>
          </button>

          {/* Docs & Architecture Code Modal */}
          <button
            onClick={onOpenDocs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A1124] hover:bg-[#0D172E] border border-[#16223B] hover:border-cyan-500/40 text-gray-200 font-medium text-xs transition-colors"
            title="View Full Architecture, n8n JSON, FastAPI & PostgreSQL Blueprints"
          >
            <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Project Blueprints</span>
          </button>

        </div>
      </div>
    </header>
  );
};
