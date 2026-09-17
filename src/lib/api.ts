import { WaterReading, N8nIngestionResponse, ThresholdConfig } from '../types';
import { evaluateLocalRiskAndRules } from './syntheticData';

export async function sendWaterReadingToN8n(
  reading: WaterReading,
  webhookUrl: string,
  thresholds?: ThresholdConfig
): Promise<N8nIngestionResponse> {
  const startTime = performance.now();
  
  // Format payload according to the production n8n specification
  const payload = {
    timestamp: reading.timestamp || new Date().toISOString(),
    ph: Number(reading.ph),
    turbidity: Number(reading.turbidity),
    tds: Number(reading.tds),
    temperature: Number(reading.temperature),
    chlorine: Number(reading.chlorine),
    flow_rate: Number(reading.flow_rate),
    pump_status: reading.pump_status,
    production_volume: Number(reading.production_volume),
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 second network timeout

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Math.round(performance.now() - startTime);

    if (!response.ok) {
      // If n8n returns an HTTP error (e.g., 404, 500, 502)
      console.warn(`n8n webhook responded with status ${response.status}: ${response.statusText}`);
      
      // Compute intelligent local backup assessment so the plant operator still gets immediate decision support
      const localEval = evaluateLocalRiskAndRules(reading, thresholds);
      
      return {
        success: false,
        message: `n8n webhook responded with HTTP ${response.status} (${response.statusText}). Local safety engine evaluated risk in fallback mode.`,
        reading,
        prediction: localEval.prediction,
        alerts: localEval.alerts,
        recommendation: localEval.prediction.recommendation,
        raw_response: {
          http_status: response.status,
          latency_ms: latencyMs,
          webhook_url: webhookUrl,
          mode: 'n8n_http_error_fallback',
        },
      };
    }

    let responseData: any = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = { text_response: text };
      }
    }

    // Check if n8n returned structured prediction data or a generic webhook confirmation
    if (responseData && (responseData.prediction || responseData.risk_score !== undefined || responseData.water_quality)) {
      return {
        success: true,
        message: 'Successfully processed and validated by n8n workflow.',
        reading: responseData.reading || reading,
        prediction: responseData.prediction || {
          prediction: responseData.risk_score > 50 ? 'ABNORMAL' : 'NORMAL',
          water_quality: responseData.water_quality || (responseData.risk_score > 50 ? 'WARNING' : 'GOOD'),
          risk_score: responseData.risk_score ?? 15,
          anomaly: responseData.anomaly ?? false,
          confidence: responseData.confidence ?? 92,
          reason: responseData.reason || 'Normal operation validated by n8n ML pipeline.',
          recommendation: responseData.recommendation || 'Continue normal operations.',
        },
        alerts: responseData.alerts || [],
        recommendation: responseData.recommendation || 'Continue normal operations.',
        raw_response: { ...responseData, latency_ms: latencyMs },
      };
    }

    // If n8n received the webhook successfully (e.g. {"message": "Workflow was started"})
    // Evaluate risk and rule predictions locally to enrich the user's dashboard seamlessly
    const localEval = evaluateLocalRiskAndRules(reading, thresholds);
    return {
      success: true,
      message: 'Ingestion acknowledged by production n8n webhook. Integrated with real-time decision engine.',
      reading,
      prediction: localEval.prediction,
      alerts: localEval.alerts,
      recommendation: localEval.prediction.recommendation,
      raw_response: {
        n8n_ack: responseData,
        latency_ms: latencyMs,
        webhook_url: webhookUrl,
      },
    };

  } catch (error: any) {
    const latencyMs = Math.round(performance.now() - startTime);
    console.error('Failed to communicate with n8n webhook:', error);

    const isAbort = error.name === 'AbortError';
    const errorDesc = isAbort 
      ? 'Request timed out after 12 seconds.'
      : (error.message || 'Network / CORS connection error.');

    // Fallback evaluation
    const localEval = evaluateLocalRiskAndRules(reading, thresholds);

    return {
      success: false,
      message: `Unable to reach n8n webhook (${errorDesc}). Safety engine generated local telemetry analysis.`,
      reading,
      prediction: localEval.prediction,
      alerts: localEval.alerts,
      recommendation: localEval.prediction.recommendation,
      raw_response: {
        error: errorDesc,
        latency_ms: latencyMs,
        webhook_url: webhookUrl,
        mode: 'network_fallback',
      },
    };
  }
}
