import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ITelemetryConfig } from '../logger/interfaces/telemetry-config.interface';

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);
  private config: ITelemetryConfig;
  private initialized = false;

  constructor(private readonly configService: ConfigService) {
    this.config = {
      serviceName:
        this.configService.get<string>('telemetry.serviceName') ??
        'backend-service',
      serviceNamespace:
        this.configService.get<string>('telemetry.serviceNamespace') ??
        'kusto-assistant',
      serviceInstanceId:
        this.configService.get<string>('telemetry.serviceInstanceId') ??
        'local',
      applicationInsightsConnectionString: this.configService.get<string>(
        'telemetry.applicationInsightsConnectionString',
      ),
      enabled: this.configService.get<boolean>('telemetry.enabled') ?? true,
      enableLiveMetrics:
        this.configService.get<boolean>('telemetry.enableLiveMetrics') ?? true,
      samplingRatio:
        this.configService.get<number>('telemetry.samplingRatio') ?? 1,
      storageDirectory: this.configService.get<string>(
        'telemetry.storageDirectory',
      ),
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (
      !this.config.enabled ||
      !this.config.applicationInsightsConnectionString
    ) {
      this.logger.log(
        'Azure Monitor telemetry disabled (no connection string or disabled)',
      );
      this.initialized = true;
      return;
    }

    try {
      const { useAzureMonitor } = await import('@azure/monitor-opentelemetry');
      useAzureMonitor({
        azureMonitorExporterOptions: {
          connectionString: this.config.applicationInsightsConnectionString,
        },
        enableLiveMetrics: this.config.enableLiveMetrics,
        samplingRatio: this.config.samplingRatio,
      });
      this.logger.log('Azure Monitor OpenTelemetry initialized');
      this.initialized = true;
    } catch (error) {
      this.logger.warn(
        `Failed to initialize Azure Monitor: ${error instanceof Error ? error.message : String(error)}`,
      );
      this.initialized = true;
    }
  }

  isEnabled(): boolean {
    return (
      this.config.enabled &&
      !!this.config.applicationInsightsConnectionString &&
      this.initialized
    );
  }
}
