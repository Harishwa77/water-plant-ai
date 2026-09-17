import React from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  BrainCircuit, 
  BellRing, 
  History, 
  SlidersHorizontal, 
  Settings, 
  FileCode2,
  ChevronRight,
  Droplets,
  Layers
} from 'lucide-react';

export type TabId = 
  | 'overview' 
  | 'live_monitoring' 
  | 'ai_intelligence' 
  | 'alerts' 
  | 'historical' 
  | 'plant_operations' 
  | 'settings';

interface SidebarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  activeAlertCount: number;
  onOpenDocs: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  activeAlertCount,
  onOpenDocs,
}) => {
  const navItems = [
    {
      id: 'overview' as TabId,
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'live_monitoring' as TabId,
      label: 'Live Monitoring',
      icon: Activity,
      badge: 'Live',
    },
    {
      id: 'ai_intelligence' as TabId,
      label: 'AI & Decision Support',
      icon: BrainCircuit,
      badge: 'ML',
    },
    {
      id: 'alerts' as TabId,
      label: 'Alert Center',
      icon: BellRing,
      badge: activeAlertCount > 0 ? `${activeAlertCount}` : null,
      badgeColor: activeAlertCount > 0 ? 'bg-rose-500 text-white' : undefined,
    },
    {
      id: 'historical' as TabId,
      label: 'Historical Analytics',
      icon: History,
      badge: null,
    },
    {
      id: 'plant_operations' as TabId,
      label: 'Plant Ingestion Sandbox',
      icon: SlidersHorizontal,
      badge: 'n8n',
    },
    {
      id: 'settings' as TabId,
      label: 'Settings & Thresholds',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0 bg-[#050B18]/90 border-b lg:border-b-0 lg:border-r border-[#16223B] p-3 lg:p-4 flex flex-row lg:flex-col justify-between overflow-x-auto lg:overflow-visible">
      <div className="flex flex-row lg:flex-col gap-1.5 w-full">
        
        {/* Navigation Category Label (Desktop) */}
        <div className="hidden lg:block px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
          Plant Navigation
        </div>

        {/* Navigation Links */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap lg:whitespace-normal ${
                isActive
                  ? 'bg-[#0A1124] text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#0A1124]/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-cyan-400' : 'text-gray-400 group-hover:text-gray-200'
                }`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold rounded-md ${
                    item.badgeColor 
                      ? item.badgeColor 
                      : isActive 
                        ? 'bg-cyan-500/20 text-cyan-300' 
                        : 'bg-[#060E1E] text-gray-400 border border-[#16223B]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Plant Specs (Desktop) */}
      <div className="hidden lg:block pt-4 mt-4 border-t border-[#16223B] space-y-3">
        <button
          onClick={onOpenDocs}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-[#0A1124] hover:bg-[#0D172E] border border-[#16223B] hover:border-cyan-500/40 text-gray-300 hover:text-cyan-300 transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <FileCode2 className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <div className="text-xs font-bold">Architecture Docs</div>
              <div className="text-[10px] text-gray-400">SQL, n8n, FastAPI</div>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <div className="p-3 rounded-xl bg-[#0A1124]/80 border border-[#16223B] text-[11px] text-gray-400 space-y-1.5">
          <div className="flex items-center justify-between text-gray-300 font-medium">
            <span className="flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              Treatment Unit 01
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">99.8% ETA</span>
          </div>
          <div className="text-[10px] text-gray-400 flex items-center justify-between">
            <span>Orchestration:</span>
            <span className="text-cyan-300 font-mono">n8n Automations</span>
          </div>
          <div className="text-[10px] text-gray-400 flex items-center justify-between">
            <span>Inference Model:</span>
            <span className="text-gray-300 font-mono">Isolation Forest</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
