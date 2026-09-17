import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  CheckCircle2, 
  LucideIcon 
} from 'lucide-react';

interface MetricCardProps {
  id?: string;
  title: string;
  value: number | string;
  unit: string;
  icon: LucideIcon;
  status: 'normal' | 'warning' | 'critical';
  thresholdText: string;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    changeText: string;
  };
  sparklineData?: number[];
  accentColor?: 'cyan' | 'blue' | 'emerald' | 'amber' | 'rose' | 'purple';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  title,
  value,
  unit,
  icon: Icon,
  status,
  thresholdText,
  trend,
  accentColor = 'cyan',
}) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'critical':
        return {
          border: 'border-rose-500/40 hover:border-rose-500/70',
          bgGlow: 'shadow-[0_0_20px_rgba(244,63,94,0.15)]',
          badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          iconBg: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
          textVal: 'text-rose-200',
        };
      case 'warning':
        return {
          border: 'border-amber-500/40 hover:border-amber-500/70',
          bgGlow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          textVal: 'text-amber-200',
        };
      default:
        return {
          border: 'border-[#16223B] hover:border-cyan-500/40',
          bgGlow: 'hover:shadow-[0_0_20px_rgba(6,182,212,0.12)]',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          textVal: 'text-white',
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div
      id={id}
      className={`relative overflow-hidden rounded-2xl bg-[#0A1124] p-4 sm:p-5 border transition-all duration-300 ${styles.border} ${styles.bgGlow} flex flex-col justify-between group`}
    >
      {/* Subtle background glow effect */}
      <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-cyan-500/5 blur-2xl group-hover:bg-cyan-500/10 transition-colors pointer-events-none" />

      {/* Top row: Icon + Title + Status badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border ${styles.iconBg} transition-transform group-hover:scale-105`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-400 tracking-wide uppercase">
              {title}
            </h3>
            <span className="text-[11px] text-gray-400">
              Safe: {thresholdText}
            </span>
          </div>
        </div>

        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${styles.badge}`}>
          {status}
        </span>
      </div>

      {/* Middle row: Big Metric Display */}
      <div className="my-3 sm:my-4 flex items-baseline gap-2">
        <span className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${styles.textVal}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {unit && (
          <span className="text-xs sm:text-sm font-medium text-gray-400">
            {unit}
          </span>
        )}
      </div>

      {/* Bottom row: Trend & Operational context */}
      <div className="pt-2 border-t border-[#16223B] flex items-center justify-between text-[11px]">
        {trend ? (
          <div className="flex items-center gap-1 font-medium">
            {trend.direction === 'up' && (
              <span className="flex items-center gap-0.5 text-cyan-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{trend.changeText}</span>
              </span>
            )}
            {trend.direction === 'down' && (
              <span className="flex items-center gap-0.5 text-blue-400">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>{trend.changeText}</span>
              </span>
            )}
            {trend.direction === 'stable' && (
              <span className="flex items-center gap-0.5 text-gray-400">
                <Minus className="w-3.5 h-3.5" />
                <span>Steady</span>
              </span>
            )}
          </div>
        ) : (
          <span className="text-gray-400">Real-time Telemetry</span>
        )}

        <div className="flex items-center gap-1 text-[10px] text-gray-400">
          {status === 'normal' ? (
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3 h-3" /> Nominal
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-400 font-medium">
              <AlertTriangle className="w-3 h-3" /> Out of Spec
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
