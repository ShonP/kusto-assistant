import { Injectable } from '@nestjs/common';
import { Agent, run, tool } from '@openai/agents';
import { z } from 'zod';
import { McpClientService } from './mcp-client.service';
import { LlmClientService } from './llm-client.service';
import { AgentStreamEvent, createEvent } from '../types/agent-event.types';
import { getAgentInstructions } from '../config/agent.config';
import { LoggerService } from '../../telemetry/logger/logger.service';
import type { KustoContext } from '../controllers/agent.controller';

interface IAgentCallbacks {
  onAnnotation: (title: string, description: string) => void;
  onToolCall: (toolName: string, args: Record<string, unknown>) => void;
  onToolResult: (toolName: string, result: unknown) => void;
  onQueryPreview: (query: string, isComplete: boolean) => void;
  onQueryResult: (args: {
    query: string;
    columns: Array<{ name: string; type: string }>;
    rows: Array<Record<string, unknown>>;
    rowCount: number;
  }) => void;
  onChartData: (args: {
    chartType: 'bar' | 'pie' | 'line';
    labels: string[];
    values: number[];
    title: string;
  }) => void;
}

interface IRunAgentParams {
  userMessage: string;
  kustoContext: KustoContext;
}

@Injectable()
export class AgentService {
  private agent: Agent | null = null;

  constructor(
    private readonly mcpClient: McpClientService,
    private readonly llmClient: LlmClientService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(AgentService.name);
  }

  private createAgent(args: {
    callbacks: IAgentCallbacks;
    kustoContext: KustoContext;
  }): Agent {
    const { callbacks, kustoContext } = args;
    const {
      onAnnotation,
      onToolCall,
      onToolResult,
      onQueryPreview,
      onQueryResult,
      onChartData,
    } = callbacks;

    this.logger.log({
      message: 'Creating agent',
      context: {
        clusterUri: kustoContext.clusterUri,
        databaseName: kustoContext.databaseName,
      },
    });

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

    const emitQueryPreviewTool = tool({
      name: 'emit_query_preview',
      description:
        'Show the user the KQL query you have generated. Call this immediately after completing the query to provide instant feedback.',
      parameters: z.object({
        query: z.string().describe('The complete KQL query'),
        isComplete: z
          .boolean()
          .describe('Whether this is the final version of the query'),
      }),
      execute: ({ query, isComplete }) => {
        onQueryPreview(query, isComplete);
        return { ok: true, message: 'Query preview sent to user' };
      },
    });

    const mcpTools = this.mcpClient.getTools();
    const agentTools = mcpTools.map((mcpTool) => {
      const zodSchema = this.convertToZodSchema(mcpTool.inputSchema);

      return tool({
        name: mcpTool.name,
        description: mcpTool.description,
        parameters: zodSchema,
        execute: async (toolArgs) => {
          onToolCall(mcpTool.name, toolArgs as Record<string, unknown>);

          const result = await this.mcpClient.callTool(
            mcpTool.name,
            toolArgs as Record<string, unknown>,
          );

          onToolResult(mcpTool.name, result);

          if (mcpTool.name === 'kusto_query') {
            this.processQueryResult({
              toolArgs: toolArgs as Record<string, unknown>,
              result,
              onQueryResult,
              onChartData,
            });
          }

          return result;
        },
      });
    });

    const model = this.llmClient.getModel();
    const allTools = [annotateStepTool, emitQueryPreviewTool, ...agentTools];
    const toolNames = allTools.map((t) => t.name);

    this.logger.log({
      message: 'Agent created successfully',
      context: {
        model,
        toolCount: toolNames.length,
        tools: toolNames.join(', '),
      },
    });

    return new Agent({
      name: 'DataIntelligenceAgent',
      instructions: getAgentInstructions(
        kustoContext.clusterUri,
        kustoContext.databaseName,
      ),
      model,
      tools: allTools,
    });
  }

  private processQueryResult(args: {
    toolArgs: Record<string, unknown>;
    result: unknown;
    onQueryResult: IAgentCallbacks['onQueryResult'];
    onChartData: IAgentCallbacks['onChartData'];
  }): void {
    const { toolArgs, result, onQueryResult, onChartData } = args;

    try {
      const query = (toolArgs.query as string) || '';
      const resultData = result as Record<string, unknown>;

      this.logger.log({
        message: 'Processing query result',
        context: {
          query: query.substring(0, 100),
          resultFormat: resultData?.format,
          hasData: !!resultData?.data,
          hasTables: !!(resultData as Record<string, unknown>)?.tables,
        },
      });

      if (!resultData || typeof resultData !== 'object') {
        return;
      }

      let columns: Array<{ name: string; type: string }> = [];
      let rows: Array<Record<string, unknown>> = [];

      if (resultData.format === 'columnar' && resultData.data) {
        const data = resultData.data as Record<string, unknown[]>;
        const columnNames = Object.keys(data);

        if (columnNames.length > 0) {
          const firstColumn = data[columnNames[0]];
          const rowCount = Array.isArray(firstColumn) ? firstColumn.length : 0;

          columns = columnNames.map((name) => {
            const values = data[name];
            let type = 'string';
            if (Array.isArray(values) && values.length > 0) {
              const firstVal = values[0];
              if (typeof firstVal === 'number') {
                type = 'long';
              } else if (
                typeof firstVal === 'string' &&
                /^\d{4}-\d{2}-\d{2}T/.test(firstVal)
              ) {
                type = 'datetime';
              }
            }
            return { name, type };
          });

          for (let i = 0; i < Math.min(rowCount, 100); i++) {
            const rowObj: Record<string, unknown> = {};
            columnNames.forEach((colName) => {
              rowObj[colName] = (data[colName] as unknown[])[i];
            });
            rows.push(rowObj);
          }

          this.logger.log({
            message: 'Columnar format parsed',
            context: {
              columnCount: columns.length,
              rowCount: rows.length,
              columns: columns.map((c) => `${c.name}:${c.type}`).join(', '),
            },
          });
        }
      } else if ((resultData as Record<string, unknown>).tables) {
        const tables = (resultData as Record<string, unknown>).tables as Array<{
          columns?: Array<{ name: string; type: string }>;
          rows?: Array<Array<unknown>>;
        }>;

        if (tables && tables.length > 0) {
          const primaryTable = tables[0];
          columns = primaryTable.columns || [];
          const rawRows = primaryTable.rows || [];

          rows = rawRows.slice(0, 100).map((row) => {
            const rowObj: Record<string, unknown> = {};
            columns.forEach((col, idx) => {
              rowObj[col.name] = row[idx];
            });
            return rowObj;
          });
        }
      }

      if (columns.length > 0 && rows.length > 0) {
        onQueryResult({
          query,
          columns,
          rows,
          rowCount: rows.length,
        });

        this.detectAndEmitChart({
          query,
          columns,
          rows,
          onChartData,
        });
      }
    } catch (error) {
      this.logger.error({
        message: 'Failed to process query result',
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  private detectAndEmitChart(args: {
    query: string;
    columns: Array<{ name: string; type: string }>;
    rows: Array<Record<string, unknown>>;
    onChartData: IAgentCallbacks['onChartData'];
  }): void {
    const { query, columns, rows, onChartData } = args;

    if (rows.length < 2 || columns.length < 2) {
      this.logger.log({
        message: 'Chart skipped - insufficient data',
        context: { rowCount: rows.length, columnCount: columns.length },
      });
      return;
    }

    const queryLower = query.toLowerCase();
    const hasSummarize = queryLower.includes('summarize');
    const hasCount =
      queryLower.includes('count()') || queryLower.includes('count(');
    const hasBy = queryLower.includes(' by ');

    if (!hasSummarize || !hasBy) {
      this.logger.log({
        message: 'Chart skipped - no summarize/by pattern',
        context: { hasSummarize, hasBy },
      });
      return;
    }

    const labelColTypes = [
      'string',
      'String',
      'datetime',
      'DateTime',
      'timespan',
      'Timespan',
    ];

    const valueColTypes = [
      'long',
      'Long',
      'int',
      'Int',
      'int32',
      'Int32',
      'int64',
      'Int64',
      'real',
      'Real',
      'double',
      'Double',
      'decimal',
      'Decimal',
    ];

    const labelCol = columns.find((c) => labelColTypes.includes(c.type));
    const valueCol = columns.find((c) => valueColTypes.includes(c.type));

    this.logger.log({
      message: 'Chart column detection',
      context: {
        columns: columns.map((c) => `${c.name}:${c.type}`).join(', '),
        labelCol: labelCol ? `${labelCol.name}:${labelCol.type}` : 'none',
        valueCol: valueCol ? `${valueCol.name}:${valueCol.type}` : 'none',
      },
    });

    if (!labelCol || !valueCol) {
      this.logger.log({
        message: 'Chart skipped - missing label or value column',
      });
      return;
    }

    const labels: string[] = rows.map((r) => {
      const val = r[labelCol.name];
      if (val === null || val === undefined) return '';
      if (typeof val === 'string') {
        if (labelCol.type.toLowerCase() === 'datetime') {
          const date = new Date(val);
          if (!isNaN(date.getTime())) {
            return date.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
          }
        }
        return val;
      }
      if (typeof val === 'number' || typeof val === 'boolean') {
        return String(val);
      }
      return JSON.stringify(val);
    });
    const values = rows.map((r) => Number(r[valueCol.name]) || 0);

    let chartType: 'bar' | 'pie' | 'line' = 'bar';
    const isTimeBasedLabel = ['datetime', 'timespan'].includes(
      labelCol.type.toLowerCase(),
    );

    if (isTimeBasedLabel || queryLower.includes('bin(')) {
      chartType = 'line';
    } else if (rows.length <= 6 && hasCount) {
      chartType = 'pie';
    }

    const title = `${valueCol.name} by ${labelCol.name}`;

    this.logger.log({
      message: 'Chart data emitted',
      context: { chartType, labelCount: labels.length, title },
    });

    onChartData({ chartType, labels, values, title });
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
  async *runAgent(params: IRunAgentParams): AsyncGenerator<AgentStreamEvent> {
    const { userMessage, kustoContext } = params;

    this.logger.log({
      message: 'Starting agent run',
      context: {
        userMessage: userMessage.substring(0, 100),
        clusterUri: kustoContext.clusterUri,
        databaseName: kustoContext.databaseName,
      },
    });

    const startTime = Date.now();

    const eventQueue: AgentStreamEvent[] = [];
    let resolveWaiting: (() => void) | null = null;

    const pushEvent = (event: AgentStreamEvent) => {
      eventQueue.push(event);
      if (resolveWaiting) {
        resolveWaiting();
        resolveWaiting = null;
      }
    };

    const callbacks: IAgentCallbacks = {
      onAnnotation: (title: string, description: string) => {
        this.logger.log({
          message: 'Agent annotation',
          context: { title, description },
        });
        pushEvent(createEvent('annotation', title, description));
      },
      onToolCall: (toolName: string, args: Record<string, unknown>) => {
        this.logger.log({
          message: 'Agent tool call started',
          context: { toolName, args: JSON.stringify(args).substring(0, 200) },
        });
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
        this.logger.log({
          message: 'Agent tool call completed',
          context: {
            toolName,
            resultPreview: JSON.stringify(result).substring(0, 200),
          },
        });
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
      onQueryPreview: (query: string, isComplete: boolean) => {
        this.logger.log({
          message: 'Query preview emitted',
          context: { queryLength: query.length, isComplete },
        });
        pushEvent(
          createEvent('query_preview', 'Query Preview', 'Generated KQL query', {
            query,
            isComplete,
          }),
        );
      },
      onQueryResult: (resultData) => {
        this.logger.log({
          message: 'Query result emitted',
          context: {
            columnCount: resultData.columns.length,
            rowCount: resultData.rowCount,
          },
        });
        pushEvent(
          createEvent(
            'query_result',
            'Query Results',
            `Retrieved ${resultData.rowCount} rows`,
            resultData,
          ),
        );
      },
      onChartData: (chartData) => {
        this.logger.log({
          message: 'Chart data emitted',
          context: {
            chartType: chartData.chartType,
            dataPoints: chartData.labels.length,
          },
        });
        pushEvent(
          createEvent(
            'chart_data',
            'Visualization',
            chartData.title,
            chartData,
          ),
        );
      },
    };

    yield createEvent(
      'annotation',
      'Agent Started',
      `Processing your request: "${userMessage}"`,
    );

    const agent = this.createAgent({ callbacks, kustoContext });

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

    const durationMs = Date.now() - startTime;

    // Handle error
    if (agentErrorMessage) {
      this.logger.error({
        message: 'Agent run failed',
        error: new Error(agentErrorMessage),
        context: { durationMs, userMessage: userMessage.substring(0, 100) },
      });
      yield createEvent('error', 'Agent Error', agentErrorMessage, {
        error: agentErrorMessage,
      });
      return;
    }

    // Emit final message
    const output = finalOutput as string | null;
    if (output) {
      yield createEvent('message', 'Response', output, {
        content: output,
      });
    }

    this.logger.log({
      message: 'Agent run completed successfully',
      context: {
        durationMs,
        outputLength: output?.length ?? 0,
        userMessage: userMessage.substring(0, 100),
      },
    });

    yield createEvent('done', 'Complete', 'Agent finished processing', {
      finalAnswer: output ?? '',
    });
  }
}
