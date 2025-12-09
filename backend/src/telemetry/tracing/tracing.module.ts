import { Module, Global, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelemetryService } from './tracing.provider';

@Global()
@Module({})
export class TelemetryModule {
  static forRootAsync(): DynamicModule {
    return {
      module: TelemetryModule,
      imports: [ConfigModule],
      providers: [TelemetryService],
      exports: [TelemetryService],
    };
  }
}
