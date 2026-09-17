import React, { useState } from 'react';
import { 
  BellRing, 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Search, 
  Filter, 
  CheckCheck, 
  Clock, 
  Trash2,
  PlusCircle
} from 'lucide-react';
import { AlertItem, AlertSeverity, AlertStatus } from '../types';

interface AlertsTabProps {
  alerts: AlertItem[];
  onAcknowledgeAlert: (id: string) => void;
  onResolveAlert: (id: string) => void;
  onClearResolved: () => void;
  onTriggerTestAlert: (severity: AlertSeverity) => void;
}

export const AlertsTab: React.FC<AlertsTabProps> = ({
  alerts,
  onAcknowledgeAlert,
  onResolveAlert,
  onClearResolved,
  onTriggerTestAlert,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | AlertSeverity>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AlertStatus>('ALL');

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch = 
      alert.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (alert.parameter && alert.parameter.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSeverity = severityFilter === 'ALL' || alert.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || alert.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <ShieldAlert className="w-3 h-3" />
            CRITICAL
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <AlertTriangle className="w-3 h-3" />
            WARNING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            <Info className="w-3 h-3" />
            INFO
          </span>
        );
    }
  };

  const getStatusBadge = (status: AlertStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 animate-pulse">
            ACTIVE
          </span>
        );
      case 'ACKNOWLEDGED':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
            ACKNOWLEDGED
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
            RESOLVED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Alert Center Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0A1124] border border-[#16223B]">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <BellRing className="w-5 h-5 text-cyan-400" />
            Plant Incident & Alert Management Center
          </h2>
          <p className="text-xs text-gray-400">
            Automated threshold violation alerts, pump safety interlocks, and ML anomaly dispatches.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onTriggerTestAlert('WARNING')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#060E1E] hover:bg-[#0D172E] border border-amber-900/60 text-amber-300 text-xs font-semibold transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Simulate Warning
          </button>
          <button
            onClick={() => onTriggerTestAlert('CRITICAL')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#060E1E] hover:bg-[#0D172E] border border-rose-900/60 text-rose-300 text-xs font-semibold transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Simulate Critical
          </button>
          <button
            onClick={onClearResolved}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#060E1E] hover:bg-[#0D172E] border border-[#16223B] text-gray-400 hover:text-gray-200 text-xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Resolved
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-xl bg-[#0A1124] border border-[#16223B] text-xs">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search alerts by parameter, violation type, message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#060E1E] border border-[#16223B] text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1 rounded-lg bg-[#060E1E] p-1 border border-[#16223B]">
          {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                severityFilter === sev
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 rounded-lg bg-[#060E1E] p-1 border border-[#16223B]">
          {(['ALL', 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

      </div>

      {/* Alerts Feed List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 rounded-2xl bg-[#0A1124] border border-[#16223B] flex flex-col items-center justify-center text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            <h3 className="text-sm font-bold text-gray-200">No Alerts Matching Filter</h3>
            <p className="text-xs text-gray-400 max-w-sm">
              Either all current plant conditions are nominal, or your active filter query returned zero items.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                alert.status === 'RESOLVED'
                  ? 'bg-[#0A1124]/60 border-[#16223B] opacity-70'
                  : alert.severity === 'CRITICAL'
                    ? 'bg-rose-950/30 border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.1)]'
                    : 'bg-amber-950/20 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
              }`}
            >
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  {getSeverityBadge(alert.severity)}
                  {getStatusBadge(alert.status)}
                  <span className="text-xs font-mono font-bold text-gray-200">
                    {alert.type}
                  </span>
                  <span className="text-[11px] text-gray-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(alert.created_at).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-medium">
                  {alert.message}
                </p>

                {alert.threshold && (
                  <div className="flex items-center gap-3 text-[11px] text-gray-400 font-mono">
                    <span>Observed: <strong className="text-white">{alert.value || 'N/A'}</strong></span>
                    <span>•</span>
                    <span>Permissible Band: <strong className="text-cyan-300">{alert.threshold}</strong></span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {alert.status === 'ACTIVE' && (
                  <button
                    onClick={() => onAcknowledgeAlert(alert.id)}
                    className="px-3 py-1.5 rounded-lg bg-[#060E1E] hover:bg-[#0D172E] border border-[#16223B] text-gray-200 text-xs font-semibold transition-colors"
                  >
                    Acknowledge
                  </button>
                )}

                {alert.status !== 'RESOLVED' && (
                  <button
                    onClick={() => onResolveAlert(alert.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-200 text-xs font-semibold transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
