import React, { useState, useMemo } from 'react';
import { 
  History, 
  Download, 
  Search, 
  FileSpreadsheet, 
  FileJson, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight,
  Calculator,
  Percent
} from 'lucide-react';
import { WaterReading, ThresholdConfig } from '../types';

interface HistoricalAnalyticsTabProps {
  historicalReadings: WaterReading[];
  thresholds: ThresholdConfig;
}

export const HistoricalAnalyticsTab: React.FC<HistoricalAnalyticsTabProps> = ({
  historicalReadings,
  thresholds,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Statistical calculations
  const stats = useMemo(() => {
    if (historicalReadings.length === 0) {
      return {
        avgPh: 7.35,
        avgTurb: 1.4,
        avgTds: 320,
        avgTemp: 24.5,
        avgFlow: 1200,
        complianceRate: 98.5,
        totalProduction: 125000,
      };
    }

    const n = historicalReadings.length;
    let sumPh = 0;
    let sumTurb = 0;
    let sumTds = 0;
    let sumTemp = 0;
    let sumFlow = 0;
    let compliantCount = 0;

    historicalReadings.forEach(r => {
      sumPh += r.ph;
      sumTurb += r.turbidity;
      sumTds += r.tds;
      sumTemp += r.temperature;
      sumFlow += r.flow_rate;

      const isCompliant = 
        r.ph >= thresholds.ph_min && 
        r.ph <= thresholds.ph_max && 
        r.turbidity <= thresholds.turbidity_max && 
        r.tds <= thresholds.tds_max;

      if (isCompliant) compliantCount++;
    });

    const lastReading = historicalReadings[historicalReadings.length - 1];

    return {
      avgPh: Number((sumPh / n).toFixed(2)),
      avgTurb: Number((sumTurb / n).toFixed(2)),
      avgTds: Math.round(sumTds / n),
      avgTemp: Number((sumTemp / n).toFixed(1)),
      avgFlow: Math.round(sumFlow / n),
      complianceRate: Number(((compliantCount / n) * 100).toFixed(1)),
      totalProduction: lastReading?.production_volume || 10000,
    };
  }, [historicalReadings, thresholds]);

  // Filtered and paginated list
  const filteredReadings = useMemo(() => {
    return historicalReadings.filter(r => {
      const timeStr = new Date(r.timestamp).toLocaleString().toLowerCase();
      const pumpStr = r.pump_status.toLowerCase();
      const search = searchTerm.toLowerCase();

      return (
        timeStr.includes(search) ||
        pumpStr.includes(search) ||
        r.ph.toString().includes(search) ||
        r.turbidity.toString().includes(search) ||
        r.tds.toString().includes(search)
      );
    });
  }, [historicalReadings, searchTerm]);

  const totalPages = Math.ceil(filteredReadings.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReadings.slice(start, start + itemsPerPage);
  }, [filteredReadings, currentPage]);

  // Export handlers
  const exportCSV = () => {
    const headers = ['Timestamp', 'pH', 'Turbidity (NTU)', 'TDS (ppm)', 'Temperature (C)', 'Chlorine (mg/L)', 'Flow Rate (L/min)', 'Pump Status', 'Production Volume (L)'];
    const rows = historicalReadings.map(r => [
      r.timestamp,
      r.ph,
      r.turbidity,
      r.tds,
      r.temperature,
      r.chlorine,
      r.flow_rate,
      r.pump_status,
      r.production_volume,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `water_plant_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(historicalReadings, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `water_plant_telemetry_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0A1124] border border-[#16223B]">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            Historical Operational Analytics & Data Vault
          </h2>
          <p className="text-xs text-gray-400">
            Immutable time-series records persisted across all sensor channels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#060E1E] hover:bg-[#0D172E] border border-[#16223B] text-gray-200 text-xs font-semibold transition-colors"
            title="Download CSV file"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            Export CSV
          </button>
          <button
            onClick={exportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#060E1E] hover:bg-[#0D172E] border border-[#16223B] text-gray-200 text-xs font-semibold transition-colors"
            title="Download JSON dataset"
          >
            <FileJson className="w-3.5 h-3.5 text-cyan-400" />
            Export JSON
          </button>
        </div>
      </div>

      {/* KPI Statistical Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-[#0A1124] border border-[#16223B]">
          <span className="text-[10px] font-bold uppercase text-gray-400">Compliance Rate</span>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
            {stats.complianceRate}%
          </div>
          <span className="text-[10px] text-gray-400">Target &gt; 95%</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0A1124] border border-[#16223B]">
          <span className="text-[10px] font-bold uppercase text-gray-400">Average pH</span>
          <div className="text-lg font-bold font-mono text-cyan-300 mt-1">
            {stats.avgPh}
          </div>
          <span className="text-[10px] text-gray-400">Mean 24h</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0A1124] border border-[#16223B]">
          <span className="text-[10px] font-bold uppercase text-gray-400">Avg Turbidity</span>
          <div className="text-lg font-bold font-mono text-blue-300 mt-1">
            {stats.avgTurb} <span className="text-xs text-gray-400">NTU</span>
          </div>
          <span className="text-[10px] text-gray-400">Mean 24h</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0A1124] border border-[#16223B]">
          <span className="text-[10px] font-bold uppercase text-gray-400">Average TDS</span>
          <div className="text-lg font-bold font-mono text-purple-300 mt-1">
            {stats.avgTds} <span className="text-xs text-gray-400">ppm</span>
          </div>
          <span className="text-[10px] text-gray-400">Permeate standard</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0A1124] border border-[#16223B]">
          <span className="text-[10px] font-bold uppercase text-gray-400">Mean Flow</span>
          <div className="text-lg font-bold font-mono text-emerald-300 mt-1">
            {stats.avgFlow} <span className="text-xs text-gray-400">L/m</span>
          </div>
          <span className="text-[10px] text-gray-400">Pump throughput</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0A1124] border border-[#16223B]">
          <span className="text-[10px] font-bold uppercase text-gray-400">Total Samples</span>
          <div className="text-lg font-bold font-mono text-white mt-1">
            {historicalReadings.length}
          </div>
          <span className="text-[10px] text-gray-400">Stored records</span>
        </div>
      </div>

      {/* Historical Data Table */}
      <div className="rounded-2xl bg-[#0A1124] border border-[#16223B] overflow-hidden space-y-3 p-4">
        
        {/* Table Search & Total Counter */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search historical records..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-[#060E1E] border border-[#16223B] text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="text-xs text-gray-400 font-mono">
            Showing {paginatedData.length} of {filteredReadings.length} entries
          </div>
        </div>

        {/* Dense Responsive Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#16223B] text-gray-400 font-semibold uppercase text-[10px] tracking-wider bg-[#060E1E]">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">pH</th>
                <th className="py-2.5 px-3">Turbidity (NTU)</th>
                <th className="py-2.5 px-3">TDS (ppm)</th>
                <th className="py-2.5 px-3">Temp (°C)</th>
                <th className="py-2.5 px-3">Chlorine (mg/L)</th>
                <th className="py-2.5 px-3">Flow (L/min)</th>
                <th className="py-2.5 px-3">Pump</th>
                <th className="py-2.5 px-3 text-right">Production</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#16223B] font-mono text-gray-300">
              {paginatedData.map((row, idx) => {
                const isTurbAbnormal = row.turbidity > thresholds.turbidity_max;
                const isPhAbnormal = row.ph < thresholds.ph_min || row.ph > thresholds.ph_max;

                return (
                  <tr key={row.id || idx} className="hover:bg-[#0D172E] transition-colors">
                    <td className="py-2 px-3 text-gray-400 whitespace-nowrap">
                      {new Date(row.timestamp).toLocaleTimeString()}
                    </td>
                    <td className={`py-2 px-3 ${isPhAbnormal ? 'text-amber-400 font-bold' : ''}`}>
                      {row.ph}
                    </td>
                    <td className={`py-2 px-3 ${isTurbAbnormal ? 'text-rose-400 font-bold' : ''}`}>
                      {row.turbidity}
                    </td>
                    <td className="py-2 px-3">
                      {row.tds}
                    </td>
                    <td className="py-2 px-3">
                      {row.temperature}°C
                    </td>
                    <td className="py-2 px-3">
                      {row.chlorine}
                    </td>
                    <td className="py-2 px-3">
                      {row.flow_rate}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        row.pump_status === 'ON' ? 'bg-emerald-950 text-emerald-300' : 'bg-[#060E1E] text-gray-400'
                      }`}>
                        {row.pump_status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-gray-200">
                      {row.production_volume.toLocaleString()} L
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Navigation */}
        <div className="flex items-center justify-between pt-2 border-t border-[#16223B] text-xs text-gray-400">
          <div>
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-[#060E1E] border border-[#16223B] hover:bg-[#0D172E] disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-[#060E1E] border border-[#16223B] hover:bg-[#0D172E] disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
