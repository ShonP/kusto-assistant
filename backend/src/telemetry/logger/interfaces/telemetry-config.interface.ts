export interface ITelemetryConfig {
  serviceName: string;
  serviceNamespace: string;
  serviceInstanceId: string;
  applicationInsightsConnectionString?: string;
  enabled: boolean;
  enableLiveMetrics: boolean;
  samplingRatio: number;
  storageDirectory?: string;
}
