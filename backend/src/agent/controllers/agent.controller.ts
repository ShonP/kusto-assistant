import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { AgentService } from '../services/agent.service';

interface AskDto {
  message: string;
  clusterName: string;
  databaseName: string;
}

export interface KustoContext {
  clusterUri: string;
  databaseName: string;
}

/**
 * Build Kusto cluster URI from cluster name
 * Example: "kuskusops" -> "https://kuskusops.kusto.windows.net/"
 */
function buildClusterUri(clusterName: string): string {
  // Remove any existing protocol or domain parts if user accidentally included them
  const cleanName = clusterName
    .replace(/^https?:\/\//, '')
    .replace(/\.kusto\.windows\.net\/?$/, '')
    .trim();

  return `https://${cleanName}.kusto.windows.net/`;
}

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  /**
   * POST /agent/ask
   * Streams agent events via SSE
   */
  @Post('ask')
  async ask(@Body() body: AskDto, @Res() res: Response): Promise<void> {
    const { message, clusterName, databaseName } = body;

    if (!message) {
      res.status(HttpStatus.BAD_REQUEST).json({ error: 'Message is required' });
      return;
    }

    if (!clusterName) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: 'clusterName is required' });
      return;
    }

    if (!databaseName) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: 'databaseName is required' });
      return;
    }

    // Build Kusto context from request
    const kustoContext: KustoContext = {
      clusterUri: buildClusterUri(clusterName),
      databaseName,
    };

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    try {
      // Stream events from the agent
      for await (const event of this.agentService.runAgent(
        message,
        kustoContext,
      )) {
        // Format as SSE
        const sseData = `data: ${JSON.stringify(event)}\n\n`;
        res.write(sseData);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
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
