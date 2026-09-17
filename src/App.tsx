import React, { useState, useEffect, useCallback } from 'react';
import { 
  WaterReading, 
  PredictionResult, 
  AlertItem, 
  ThresholdConfig, 
  SimulationScenario, 
  N8nIngestionResponse,
  AlertSeverity
} from './types';
import { 
  DEFAULT_THRESHOLDS, 
  DEFAULT_PRODUCTION_WEBHOOK_URL, 
  SIMULATION_SCENARIOS 
} from './lib/constants';
import { 
  generateInitialReadings, 
  evaluateLocalRiskAndRules 
} from './lib/syntheticData';
import { sendWaterReadingToN8n } from './lib/api';

import { Header } from './components/Header';
import { Sidebar, TabId } from './components/Sidebar';
import { OverviewTab } from './components/OverviewTab';
import { LiveMonitoringTab } from './components/LiveMonitoringTab';
import { AIIntelligenceTab } from './components/AIIntelligenceTab';
import { AlertsTab } from './components/AlertsTab';
import { HistoricalAnalyticsTab } from './components/HistoricalAnalyticsTab';
import { PlantOperationsTab } from './components/PlantOperationsTab';
import { SettingsTab } from './components/SettingsTab';
import { ArchitectureDocsModal } from './components/ArchitectureDocsModal';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  // Settings & Configuration
  const [thresholds, setThresholds] = useState<ThresholdConfig>(DEFAULT_THRESHOLDS);
  const [webhookUrl, setWebhookUrl] = useState<string>(DEFAULT_PRODUCTION_WEBHOOK_URL);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [isAutoStream, setIsAutoStream] = useState<boolean>(false);

  // Data State
  const [historicalReadings, setHistoricalReadings] = useState<WaterReading[]>(() => generateInitialReadings(30));
  
  const [currentReading, setCurrentReading] = useState<WaterReading>(() => {
    const initial = generateInitialReadings(1)[0];
    return initial;
  });

  const [prediction, setPrediction] = useState<PredictionResult>(() => {
    const initial = generateInitialReadings(1)[0];
    return evaluateLocalRiskAndRules(initial, DEFAULT_THRESHOLDS).prediction;
  });

  const [alerts, setAlerts] = useState<AlertItem[]>(() => {
    const initial = generateInitialReadings(1)[0];
    return evaluateLocalRiskAndRules(initial, DEFAULT_THRESHOLDS).alerts;
  });

  const [lastIngestionResponse, setLastIngestionResponse] = useState<N8nIngestionResponse | null>(null);
  const [isIngesting, setIsIngesting] = useState(false);

  // Process and ingest a reading
  const processReading = useCallback(async (reading: WaterReading): Promise<N8nIngestionResponse> => {
    setIsIngesting(true);
    
    let result: N8nIngestionResponse;

    if (isDemoMode) {
      // Synthetic Demo Mode
      const evalResult = evaluateLocalRiskAndRules(reading, thresholds);
      result = {
        success: true,
        message: 'Processed in Synthetic Demo Mode.',
        reading,
        prediction: evalResult.prediction,
        alerts: evalResult.alerts,
        recommendation: evalResult.prediction.recommendation,
        raw_response: { mode: 'synthetic_demo' },
      };
    } else {
      // Live Dispatch to Production n8n Webhook
      result = await sendWaterReadingToN8n(reading, webhookUrl, thresholds);
    }

    setCurrentReading(reading);
    
    // Add to historical buffer (keep max 150 readings)
    setHistoricalReadings(prev => {
      const updated = [...prev, reading];
      if (updated.length > 150) return updated.slice(-150);
      return updated;
    });

    if (result.prediction) {
      setPrediction(result.prediction);
    }

    // Merge alerts if generated
    if (result.alerts && result.alerts.length > 0) {
      setAlerts(prev => {
        const newAlerts = result.alerts!.filter(
          newAlt => !prev.some(p => p.type === newAlt.type && p.status === 'ACTIVE')
        );
        return [...newAlerts, ...prev];
      });
    }

    setLastIngestionResponse(result);
    setIsIngesting(false);
    return result;
  }, [isDemoMode, webhookUrl, thresholds]);

  // Handle Scenario Quick Ingestion
  const handleSelectScenario = useCallback(async (scenario: SimulationScenario) => {
    const newReading: WaterReading = {
      id: `rd-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...scenario.data,
      created_at: new Date().toISOString(),
    };
    await processReading(newReading);
  }, [processReading]);

  // Quick Ingest Button (Header)
  const handleQuickSimulate = useCallback(async () => {
    // Generate subtle jitter around current values
    const jitter = (Math.random() - 0.5);
    const newReading: WaterReading = {
      id: `rd-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ph: Number(Math.max(5.5, Math.min(9.5, currentReading.ph + jitter * 0.2)).toFixed(2)),
      turbidity: Number(Math.max(0.5, Math.min(10.0, currentReading.turbidity + jitter * 0.4)).toFixed(2)),
      tds: Math.round(Math.max(200, Math.min(800, currentReading.tds + jitter * 15))),
      temperature: Number(Math.max(18, Math.min(38, currentReading.temperature + jitter * 0.6)).toFixed(1)),
      chlorine: Number(Math.max(0.1, Math.min(2.5, currentReading.chlorine + jitter * 0.1)).toFixed(2)),
      flow_rate: Math.round(Math.max(200, Math.min(1800, currentReading.flow_rate + jitter * 40))),
      pump_status: currentReading.pump_status,
      production_volume: currentReading.production_volume + 25,
      created_at: new Date().toISOString(),
    };
    await processReading(newReading);
  }, [currentReading, processReading]);

  // Auto-streaming ticker (every 4 seconds if enabled)
  useEffect(() => {
    if (!isAutoStream) return;
    const interval = setInterval(() => {
      handleQuickSimulate();
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoStream, handleQuickSimulate]);

  // Alert Management Handlers
  const handleAcknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a));
  };

  const handleResolveAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'RESOLVED', resolved_at: new Date().toISOString() } : a));
  };

  const handleClearResolved = () => {
    setAlerts(prev => prev.filter(a => a.status !== 'RESOLVED'));
  };

  const handleTriggerTestAlert = (severity: AlertSeverity) => {
    const newAlert: AlertItem = {
      id: `alt-test-${Date.now()}`,
      severity,
      type: severity === 'CRITICAL' ? 'EMERGENCY_SHUTDOWN_TEST' : 'MANUAL_INSPECTION_WARNING',
      message: severity === 'CRITICAL' 
        ? 'Manual test trigger: Emergency safety threshold breached.' 
        : 'Manual test trigger: Secondary filter requires routine inspection.',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      parameter: 'Manual Test',
      value: 'Simulated',
      threshold: 'Test Band',
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  // Determine overall plant status
  const plantStatus = prediction.water_quality === 'CRITICAL' 
    ? 'CRITICAL' 
    : prediction.water_quality === 'WARNING' 
      ? 'WARNING' 
      : 'ONLINE';

  return (
    <div className="min-h-screen bg-[#050B18] text-gray-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* 1. Industrial Top Header */}
      <Header
        plantStatus={plantStatus}
        overallRisk={prediction.risk_score}
        activeAlerts={alerts.filter(a => a.status === 'ACTIVE')}
        isDemoMode={isDemoMode}
        setIsDemoMode={setIsDemoMode}
        webhookUrl={webhookUrl}
        onOpenDocs={() => setIsDocsOpen(true)}
        onQuickSimulate={handleQuickSimulate}
        isSimulating={isIngesting}
      />

      {/* 2. Main Body Container with Sidebar Navigation */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto">
        
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeAlertCount={alerts.filter(a => a.status === 'ACTIVE').length}
          onOpenDocs={() => setIsDocsOpen(true)}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'overview' && (
            <OverviewTab
              currentReading={currentReading}
              prediction={prediction}
              alerts={alerts}
              historicalReadings={historicalReadings}
              thresholds={thresholds}
              onSelectScenario={handleSelectScenario}
              onNavigateTab={setActiveTab}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              isIngesting={isIngesting}
            />
          )}

          {activeTab === 'live_monitoring' && (
            <LiveMonitoringTab
              historicalReadings={historicalReadings}
              currentReading={currentReading}
              thresholds={thresholds}
              onRefresh={handleQuickSimulate}
              isAutoStream={isAutoStream}
              setIsAutoStream={setIsAutoStream}
            />
          )}

          {activeTab === 'ai_intelligence' && (
            <AIIntelligenceTab
              prediction={prediction}
              currentReading={currentReading}
              thresholds={thresholds}
              onOpenDocs={() => setIsDocsOpen(true)}
            />
          )}

          {activeTab === 'alerts' && (
            <AlertsTab
              alerts={alerts}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onResolveAlert={handleResolveAlert}
              onClearResolved={handleClearResolved}
              onTriggerTestAlert={handleTriggerTestAlert}
            />
          )}

          {activeTab === 'historical' && (
            <HistoricalAnalyticsTab
              historicalReadings={historicalReadings}
              thresholds={thresholds}
            />
          )}

          {activeTab === 'plant_operations' && (
            <PlantOperationsTab
              webhookUrl={webhookUrl}
              onSendReading={processReading}
              lastIngestionResponse={lastIngestionResponse}
              isIngesting={isIngesting}
              thresholds={thresholds}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              thresholds={thresholds}
              setThresholds={setThresholds}
              webhookUrl={webhookUrl}
              setWebhookUrl={setWebhookUrl}
              onOpenDocs={() => setIsDocsOpen(true)}
            />
          )}
        </main>
      </div>

      {/* 3. Interactive Architecture & Blueprints Modal */}
      <ArchitectureDocsModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />

    </div>
  );
}
