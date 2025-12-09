import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiProduces,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AgentService } from '../services/agent.service';
import { AskAgentDto } from '../dto/ask-agent.dto';
import { LoggerService } from '../../telemetry/logger/logger.service';

export interface KustoContext {
  clusterUri: string;
  databaseName: string;
}

function buildClusterUri(clusterName: string): string {
  const cleanName = clusterName
    .replace(/^https?:\/\//, '')
    .replace(/\.kusto\.windows\.net\/?$/, '')
    .trim();

  return `https://${cleanName}.kusto.windows.net/`;
}

@ApiTags('Agent')
@Controller('agent')
export class AgentController {
  constructor(
    private readonly agentService: AgentService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(AgentController.name);
  }

  @Post('ask')
  @ApiOperation({
    summary: 'Ask the KQL autocomplete agent',
    description:
      'Streams agent events via Server-Sent Events (SSE). The agent will autocomplete KQL queries based on the provided message and Kusto context.',
  })
  @ApiProduces('text/event-stream')
  @ApiResponse({
    status: 200,
    description: 'SSE stream of agent events',
    content: {
      'text/event-stream': {
        schema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['annotation', 'tool_call', 'tool_result', 'message', 'done', 'error'],
            },
            title: { type: 'string' },
            description: { type: 'string' },
            data: { type: 'object' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async ask(@Body() body: AskAgentDto, @Res() res: Response): Promise<void> {
    const { message, clusterName, databaseName } = body;

    this.logger.log({
      message: 'Agent ask request received',
      context: {
        clusterName,
        databaseName,
        messagePreview: message.substring(0, 100),
      },
    });

    const kustoContext: KustoContext = {
      clusterUri: buildClusterUri(clusterName),
      databaseName,
    };

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    const startTime = Date.now();
    let eventCount = 0;

    try {
      for await (const event of this.agentService.runAgent(
        message,
        kustoContext,
      )) {
        eventCount++;
        const sseData = `data: ${JSON.stringify(event)}\n\n`;
        res.write(sseData);
      }

      this.logger.log({
        message: 'Agent ask request completed',
        context: {
          durationMs: Date.now() - startTime,
          eventCount,
          clusterName,
          databaseName,
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error({
        message: 'Agent ask request failed',
        error: error instanceof Error ? error : new Error(errorMessage),
        context: {
          durationMs: Date.now() - startTime,
          clusterName,
          databaseName,
        },
      });

      const errorEvent = {
        type: 'error',
        title: 'Agent Error',
        description: errorMessage,
        data: { error: errorMessage },
        timestamp: new Date().toISOString(),
      };
      res.write(`data: ${JSON.stringify(errorEvent)}\n\n`);
    } finally {
      res.end();
    }
  }
}
