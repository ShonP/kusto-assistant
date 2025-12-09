import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgentController } from './controllers/agent.controller';
import { AgentService } from './services/agent.service';
import { McpClientService } from './services/mcp-client.service';
import { LlmClientService } from './services/llm-client.service';
import { llmConfig } from './config/llm.config';

@Module({
  imports: [ConfigModule.forFeature(llmConfig)],
  controllers: [AgentController],
  providers: [AgentService, McpClientService, LlmClientService],
  exports: [AgentService, McpClientService, LlmClientService],
})
export class AgentModule {}
