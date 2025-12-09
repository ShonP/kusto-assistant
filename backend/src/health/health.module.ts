import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { LlmHealthIndicator } from './indicators/llm-health.indicator';
import { AgentModule } from '../agent/agent.module';

@Module({
  imports: [TerminusModule, AgentModule],
  controllers: [HealthController],
  providers: [LlmHealthIndicator],
})
export class HealthModule {}
