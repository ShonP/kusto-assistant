import { Injectable } from '@nestjs/common';
import { Agent, run, tool } from '@openai/agents';
import { z } from 'zod';
import { McpClientService } from './mcp-client.service';
import { AgentStreamEvent, createEvent } from '../types/agent-event.types';
import { getAgentInstructions, AGENT_MODEL } from '../config/agent.config';
import type { KustoContext } from '../controllers/agent.controller';

// Callback types for event emission
interface AgentCallbacks {
  onAnnotation: (title: string, description: string) => void;
  onToolCall: (toolName: string, args: Record<string, unknown>) => void;
  onToolResult: (toolName: string, result: unknown) => void;
}

@Injectable()
export class AgentService {
  private agent: Agent | null = null;

  constructor(private readonly mcpClient: McpClientService) {}

  /**
   * Create the agent with all tools (MCP + annotate_step)
   */
  private createAgent(
    callbacks: AgentCallbacks,
    kustoContext: KustoContext,
  ): Agent {
    const { onAnnotation, onToolCall, onToolResult } = callbacks;

    // Create annotate_step tool that emits events
    const annotateStepTool = tool({
      name: 'annotate_step',
      description:
        'Narrate your current action to keep the user informed. Call this before and after every tool call.',
      parameters: z.object({
        title: z.string().describe('Short title for this step (1-3 words)'),
        description: z
          .string()
          .describe('Detailed description of what you are doing'),
      }),
      execute: ({ title, description }) => {
        onAnnotation(title, description);
        return { ok: true };
      },
    });

    // Create tools from MCP server
    const mcpTools = this.mcpClient.getTools();
    const agentTools = mcpTools.map((mcpTool) => {
      // Convert MCP tool schema to Zod schema dynamically
      const zodSchema = this.convertToZodSchema(mcpTool.inputSchema);

      return tool({
        name: mcpTool.name,
        description: mcpTool.description,
        parameters: zodSchema,
        execute: async (args) => {
          // Emit tool_call event before execution
          onToolCall(mcpTool.name, args as Record<string, unknown>);

          const result = await this.mcpClient.callTool(
            mcpTool.name,
            args as Record<string, unknown>,
          );

          // Emit tool_result event after execution
          onToolResult(mcpTool.name, result);

          return result;
        },
      });
    });

    return new Agent({
      name: 'DataIntelligenceAgent',
      instructions: getAgentInstructions(
        kustoContext.clusterUri,
        kustoContext.databaseName,
      ),
      model: AGENT_MODEL,
      // tools: agentTools,
      tools: [annotateStepTool, ...agentTools],
    });
  }

  /**
   * Convert JSON Schema to Zod schema
   * OpenAI strict mode requires all properties in 'required' array.
   * For optional params, we use .nullable() so they can be null.
   */
  private convertToZodSchema(
    jsonSchema: Record<string, unknown>,
  ): z.AnyZodObject {
    const properties = jsonSchema.properties as
      | Record<
          string,
          { type: string; description?: string; default?: unknown }
        >
      | undefined;
    const required = (jsonSchema.required as string[]) || [];

    if (!properties) {
      return z.object({});
    }

    const shape: Record<string, z.ZodTypeAny> = {};

    for (const [key, prop] of Object.entries(properties)) {
      let zodType: z.ZodTypeAny;

      switch (prop.type) {
        case 'string':
          zodType = z.string();
          break;
        case 'number':
        case 'integer':
          zodType = z.number();
          break;
        case 'boolean':
          zodType = z.boolean();
          break;
        default:
          zodType = z.string();
      }

      if (prop.description) {
        zodType = zodType.describe(prop.description);
      }

      // For optional params, make them nullable (strict mode compatible)
      if (!required.includes(key)) {
        zodType = zodType.nullable();
      }

      shape[key] = zodType;
    }

    return z.object(shape);
  }

  /**
   * Run the agent with streaming events
   * Uses a generator to yield events as they happen
   */
  async *runAgent(
    userMessage: string,
    kustoContext: KustoContext,
  ): AsyncGenerator<AgentStreamEvent> {
    // Queue to collect events during execution
    const eventQueue: AgentStreamEvent[] = [];
    let resolveWaiting: (() => void) | null = null;

    // Helper to push event and wake up the generator
    const pushEvent = (event: AgentStreamEvent) => {
      eventQueue.push(event);
      if (resolveWaiting) {
        resolveWaiting();
        resolveWaiting = null;
      }
    };

    // Create callbacks for all event types
    const callbacks: AgentCallbacks = {
      onAnnotation: (title: string, description: string) => {
        pushEvent(createEvent('annotation', title, description));
      },
      onToolCall: (toolName: string, args: Record<string, unknown>) => {
        pushEvent(
          createEvent(
            'tool_call',
            `Calling ${toolName}`,
            `Invoking tool with arguments`,
            {
              tool: toolName,
              input: args,
            },
          ),
        );
      },
      onToolResult: (toolName: string, result: unknown) => {
        pushEvent(
          createEvent(
            'tool_result',
            `${toolName} Complete`,
            `Tool returned result`,
            {
              tool: toolName,
              output: result,
            },
          ),
        );
      },
    };

    // Emit initial event
    yield createEvent(
      'annotation',
      'Agent Started',
      `Processing your request: "${userMessage}"`,
    );

    // Create agent with all callbacks
    const agent = this.createAgent(callbacks, kustoContext);

    // Start agent execution in background
    let finalOutput: string | null = null;
    let agentErrorMessage: string | null = null;
    let agentDone = false;

    const agentPromise = run(agent, userMessage, { maxTurns: 20 })
      .then((result) => {
        finalOutput =
          typeof result.finalOutput === 'string'
            ? result.finalOutput
            : JSON.stringify(result.finalOutput);
        agentDone = true;
        if (resolveWaiting) {
          resolveWaiting();
          resolveWaiting = null;
        }
      })
      .catch((error: unknown) => {
        agentErrorMessage =
          error instanceof Error ? error.message : String(error);
        agentDone = true;
        if (resolveWaiting) {
          resolveWaiting();
          resolveWaiting = null;
        }
      });

    // Yield events as they come in
    while (!agentDone || eventQueue.length > 0) {
      // Yield all queued events
      while (eventQueue.length > 0) {
        const event = eventQueue.shift();
        if (event) {
          yield event;
        }
      }

      // If agent is done, break
      if (agentDone) {
        break;
      }

      // Wait for more events or completion
      await new Promise<void>((resolve) => {
        resolveWaiting = resolve;
        // Timeout to check periodically
        setTimeout(resolve, 100);
      });
    }

    // Wait for agent to fully complete
    await agentPromise;

    // Handle error
    if (agentErrorMessage) {
      yield createEvent('error', 'Agent Error', agentErrorMessage, {
        error: agentErrorMessage,
      });
      return;
    }

    // Emit final message
    if (finalOutput) {
      yield createEvent('message', 'Response', finalOutput, {
        content: finalOutput,
      });
    }

    yield createEvent('done', 'Complete', 'Agent finished processing', {
      finalAnswer: finalOutput || '',
    });
  }
}
