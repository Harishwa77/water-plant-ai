import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Droplets, 
  FlaskConical, 
  Layers, 
  Thermometer, 
  Wind, 
  Sliders, 
  RefreshCw, 
  TrendingUp, 
  Maximize2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { WaterReading, ThresholdConfig } from '../types';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';

interface LiveMonitoringTabProps {
  historicalReadings: WaterReading[];
  currentReading: WaterReading;
  thresholds: ThresholdConfig;
  onRefresh: () => void;
  isAutoStream: boolean;
  setIsAutoStream: (val: boolean) => void;
}

type TimeRange = '1h' | '6h' | '24h' | '7d';

export const LiveMonitoringTab: React.FC<LiveMonitoringTabProps> = ({
  historicalReadings,
  currentReading,
  thresholds,
  onRefresh,
  isAutoStream,
  setIsAutoStream,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('1h');
  const [selectedSensor, setSelectedSensor] = useState<'all' | 'ph' | 'turbidity' | 'tds' | 'temperature' | 'flow'>('all');

  // Filter or scale data based on time range selection
  const chartData = useMemo(() => {
    let multiplier = 1;
    let sliceCount = 30;

    if (timeRange === '1h') sliceCount = 30;
    else if (timeRange === '6h') sliceCount = 60;
    else if (timeRange === '24h') sliceCount = 100;
    else if (timeRange === '7d') sliceCount = 150;

    const baseData = historicalReadings.slice(-sliceCount);
    
    return baseData.map((r, i) => {
      const date = new Date(r.timestamp);
      const timeStr = timeRange === '7d' 
        ? `${date.getMonth() + 1}/${date.getDate()}`
        : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return {
        ...r,
        formattedTime: timeStr,
        index: i,
      };
    });
  }, [historicalReadings, timeRange]);

  return (
    <div className="space-y-6">
      
      {/* Control Header & Time Window Selection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#0A1124] border border-[#16223B]">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Live Industrial Telemetry & Sensor Streams
          </h2>
          <p className="text-xs text-gray-400">
            Real-time continuous sampling synchronized with production n8n ingestion pipeline.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          
          {/* Time Window Buttons */}
          <div className="flex items-center rounded-xl bg-[#060E1E] p-1 border border-[#16223B] text-xs">
            {(['1h', '6h', '24h', '7d'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {range === '1h' && 'Last 1 Hour'}
                {range === '6h' && 'Last 6 Hours'}
                {range === '24h' && 'Last 24 Hours'}
                {range === '7d' && 'Last 7 Days'}
              </button>
            ))}
          </div>

          {/* Auto-Stream Toggle */}
          <button
            onClick={() => setIsAutoStream(!isAutoStream)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isAutoStream
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/70'
                : 'bg-[#060E1E] text-gray-400 border-[#16223B]'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isAutoStream ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`} />
            {isAutoStream ? 'Auto-Polling (3s)' : 'Polling Paused'}
          </button>

          {/* Manual Refresh */}
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl bg-[#060E1E] hover:bg-[#0D172E] border border-[#16223B] text-gray-300 transition-colors"
            title="Force refresh telemetry snapshot"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

        </div>
      </div>

      {/* Sensor Channel Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedSensor('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedSensor === 'all'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'bg-[#0A1124] text-gray-400 border border-[#16223B] hover:text-gray-200'
          }`}
        >
          All 5 Sensor Channels
        </button>
        <button
          onClick={() => setSelectedSensor('turbidity')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedSensor === 'turbidity'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'bg-[#0A1124] text-gray-400 border border-[#16223B] hover:text-gray-200'
          }`}
        >
          Turbidity (NTU)
        </button>
        <button
          onClick={() => setSelectedSensor('ph')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedSensor === 'ph'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
              : 'bg-[#0A1124] text-gray-400 border border-[#16223B] hover:text-gray-200'
          }`}
        >
          pH Level
        </button>
        <button
          onClick={() => setSelectedSensor('tds')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedSensor === 'tds'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'bg-[#0A1124] text-gray-400 border border-[#16223B] hover:text-gray-200'
          }`}
        >
          Total Dissolved Solids (ppm)
        </button>
        <button
          onClick={() => setSelectedSensor('temperature')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedSensor === 'temperature'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-[#0A1124] text-gray-400 border border-[#16223B] hover:text-gray-200'
          }`}
        >
          Process Temperature (°C)
        </button>
        <button
          onClick={() => setSelectedSensor('flow')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedSensor === 'flow'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-[#0A1124] text-gray-400 border border-[#16223B] hover:text-gray-200'
          }`}
        >
          Treated Flow (L/min)
        </button>
      </div>

      {/* Primary Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Turbidity Time-Series (Key Water Quality Metric) */}
        {(selectedSensor === 'all' || selectedSensor === 'turbidity') && (
          <div className="p-5 rounded-2xl bg-[#0A1124] border border-[#16223B] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">
                    Turbidity (NTU) Stream
                  </h3>
                  <span className="text-[11px] text-gray-400 font-mono">
                    Current: <strong className="text-cyan-300">{currentReading.turbidity} NTU</strong> (Safe &lt; {thresholds.turbidity_max} NTU)
                  </span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#060E1E] text-cyan-300 border border-[#16223B] font-mono">
                Clarifier #1
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="turbColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#16223B" vertical={false} />
                  <XAxis dataKey="formattedTime" stroke="#475569" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 10 }} domain={[0, 'dataMax + 2']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#060E1E', borderColor: '#16223B', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <ReferenceLine y={thresholds.turbidity_max} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'Safety Limit', fill: '#f43f5e', fontSize: 10, position: 'insideTopRight' }} />
                  <Area 
                    type="monotone" 
                    dataKey="turbidity" 
                    stroke="#22d3ee" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#turbColor)" 
                    name="Turbidity (NTU)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 2. pH Time-Series */}
        {(selectedSensor === 'all' || selectedSensor === 'ph') && (
          <div className="p-5 rounded-2xl bg-[#0A1124] border border-[#16223B] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">
                    pH Level Stream
                  </h3>
                  <span className="text-[11px] text-gray-400 font-mono">
                    Current: <strong className="text-blue-300">{currentReading.ph} pH</strong> (Target {thresholds.ph_min} - {thresholds.ph_max})
                  </span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#060E1E] text-blue-300 border border-[#16223B] font-mono">
                Electrochemical Probe
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#16223B" vertical={false} />
                  <XAxis dataKey="formattedTime" stroke="#475569" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 10 }} domain={[5, 10]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#060E1E', borderColor: '#16223B', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <ReferenceLine y={thresholds.ph_min} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Min pH', fill: '#f59e0b', fontSize: 10 }} />
                  <ReferenceLine y={thresholds.ph_max} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Max pH', fill: '#f59e0b', fontSize: 10 }} />
                  <Line 
                    type="monotone" 
                    dataKey="ph" 
                    stroke="#38bdf8" 
                    strokeWidth={2.5}
                    dot={false}
                    name="pH Level"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 3. Total Dissolved Solids (TDS) */}
        {(selectedSensor === 'all' || selectedSensor === 'tds') && (
          <div className="p-5 rounded-2xl bg-[#0A1124] border border-[#16223B] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">
                    Total Dissolved Solids (ppm)
                  </h3>
                  <span className="text-[11px] text-gray-400 font-mono">
                    Current: <strong className="text-purple-300">{currentReading.tds} ppm</strong> (Limit &lt; {thresholds.tds_max} ppm)
                  </span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#060E1E] text-purple-300 border border-[#16223B] font-mono">
                RO Permeate Sensor
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tdsColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#16223B" vertical={false} />
                  <XAxis dataKey="formattedTime" stroke="#475569" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 10 }} domain={[200, 'dataMax + 100']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#060E1E', borderColor: '#16223B', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <ReferenceLine y={thresholds.tds_max} stroke="#f43f5e" strokeDasharray="3 3" />
                  <Area 
                    type="monotone" 
                    dataKey="tds" 
                    stroke="#c084fc" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#tdsColor)" 
                    name="TDS (ppm)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 4. Flow Rate & Temperature Dual-Axis */}
        {(selectedSensor === 'all' || selectedSensor === 'flow' || selectedSensor === 'temperature') && (
          <div className="p-5 rounded-2xl bg-[#0A1124] border border-[#16223B] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Wind className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">
                    Treated Flow Rate & Temperature
                  </h3>
                  <span className="text-[11px] text-gray-400 font-mono">
                    Flow: <strong className="text-emerald-300">{currentReading.flow_rate} L/min</strong> | Temp: <strong className="text-amber-300">{currentReading.temperature}°C</strong>
                  </span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#060E1E] text-emerald-300 border border-[#16223B] font-mono">
                Ultrasonic Flow Meter
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#16223B" vertical={false} />
                  <XAxis dataKey="formattedTime" stroke="#475569" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 10 }} domain={[0, 'dataMax + 200']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#060E1E', borderColor: '#16223B', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="flow_rate" 
                    stroke="#10b981" 
                    strokeWidth={2.5}
                    dot={false}
                    name="Flow Rate (L/min)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
