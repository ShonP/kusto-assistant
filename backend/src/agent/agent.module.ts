import { Module } from '@nestjs/common';
import { AgentController } from './controllers/agent.controller';
import { AgentService } from './services/agent.service';
import { McpClientService } from './services/mcp-client.service';

@Module({
  controllers: [AgentController],
  providers: [AgentService, McpClientService],
  exports: [AgentService, McpClientService],
})
export class AgentModule {}
