import { Module } from '@nestjs/common';
import { AgentController } from './controllers/agent.controller';
import { AgentService } from './services/agent.service';
import { McpClientService } from './services/mcp-client.service';
import { LlmClientService } from './services/llm-client.service';

@Module({
  controllers: [AgentController],
  providers: [AgentService, McpClientService, LlmClientService],
  exports: [AgentService, McpClientService, LlmClientService],
})
export class AgentModule {}
