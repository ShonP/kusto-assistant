import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { CoreModule } from './core/core.module';
import { TelemetryModule } from './telemetry/tracing/tracing.module';
import { HttpModule } from './infrastructure/http/http.module';
import { AppService } from './app.service';
import { AgentModule } from './agent/agent.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule,
    TelemetryModule.forRootAsync(),
    CoreModule,
    HttpModule,
    AgentModule,
    HealthModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
