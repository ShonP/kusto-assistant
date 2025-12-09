export async function initializeTelemetry(): Promise<void> {
  const connectionString =
    process.env.APPLICATIONINSIGHTS_CONNECTION_STRING ||
    process.env.TELEMETRY_APPLICATIONINSIGHTS_CONNECTION_STRING;
  const enabled = process.env.NODE_ENV !== 'test';
  const enableLiveMetrics =
    process.env.TELEMETRY_ENABLE_LIVE_METRICS === 'true';
  const samplingRatio = parseFloat(process.env.TELEMETRY_SAMPLING_RATIO || '1');

  if (enabled && connectionString) {
    try {
      /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
      const { useAzureMonitor } = await import('@azure/monitor-opentelemetry');
      useAzureMonitor({
        azureMonitorExporterOptions: {
          connectionString,
        },
        enableLiveMetrics,
        samplingRatio,
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */

      console.log('Azure Monitor OpenTelemetry initialized');
    } catch (error) {
      console.warn(
        `Failed to initialize Azure Monitor: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
