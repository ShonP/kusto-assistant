import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { MCP_SERVERS, McpServerConfig } from '../config/mcp-servers.config';
import { LoggerService } from '../../telemetry/logger/logger.service';

interface TextContent {
  type: 'text';
  text: string;
}

interface ToolResult {
  content: Array<TextContent | { type: string }>;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  serverName: string; // Track which server this tool belongs to
}

interface McpConnection {
  config: McpServerConfig;
  client: Client;
  transport: StdioClientTransport;
  tools: MCPTool[];
}

@Injectable()
export class McpClientService implements OnModuleInit, OnModuleDestroy {
  private connections: Map<string, McpConnection> = new Map();
  private allTools: MCPTool[] = [];

  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(McpClientService.name);
  }

  async onModuleInit() {
    await this.connectAll();
  }

  async onModuleDestroy() {
    await this.disconnectAll();
  }

  /**
   * Connect to all enabled MCP servers
   */
  async connectAll(): Promise<void> {
    const enabledServers = MCP_SERVERS.filter((s) => s.enabled);
    this.logger.log({
      message: 'Connecting to MCP servers',
      context: {
        serverCount: enabledServers.length,
        servers: enabledServers.map((s) => s.name).join(', '),
      },
    });

    const connectionPromises = enabledServers.map((config) =>
      this.connectToServer(config),
    );

    const results = await Promise.allSettled(connectionPromises);

    results.forEach((result, index) => {
      const serverName = enabledServers[index].name;
      if (result.status === 'fulfilled') {
        this.logger.log({
          message: 'MCP server connected',
          context: { serverName },
        });
      } else {
        this.logger.error({
          message: 'MCP server connection failed',
          error:
            result.reason instanceof Error
              ? result.reason
              : new Error(String(result.reason)),
          context: { serverName },
        });
      }
    });

    this.refreshAllTools();
  }

  /**
   * Connect to a single MCP server
   */
  private async connectToServer(config: McpServerConfig): Promise<void> {
    try {
      this.logger.log({
        message: 'Connecting to MCP server',
        context: {
          serverName: config.name,
          command: config.command,
          args: config.args.join(' '),
        },
      });

      const mergedEnv: Record<string, string> = {};
      if (config.env) {
        for (const [key, value] of Object.entries(process.env)) {
          if (value !== undefined) {
            mergedEnv[key] = value;
          }
        }
        Object.assign(mergedEnv, config.env);
      }

      const transport = new StdioClientTransport({
        command: config.command,
        args: config.args,
        env: config.env ? mergedEnv : undefined,
      });

      const client = new Client({
        name: `agent-client-${config.name}`,
        version: '1.0.0',
      });

      await client.connect(transport);

      const result = await client.listTools();
      const tools: MCPTool[] = result.tools.map((tool) => ({
        name: tool.name,
        description: tool.description || '',
        inputSchema: tool.inputSchema as Record<string, unknown>,
        serverName: config.name,
      }));

      this.logger.log({
        message: 'MCP server tools discovered',
        context: {
          serverName: config.name,
          toolCount: tools.length,
          tools: tools.map((t) => t.name).join(', '),
        },
      });

      this.connections.set(config.name, {
        config,
        client,
        transport,
        tools,
      });
    } catch (error) {
      this.logger.error({
        message: 'Failed to connect to MCP server',
        error: error instanceof Error ? error : new Error(String(error)),
        context: { serverName: config.name },
      });
      throw error;
    }
  }

  /**
   * Refresh the aggregated tools list from all connections
   */
  private refreshAllTools(): void {
    this.allTools = [];
    for (const connection of this.connections.values()) {
      this.allTools.push(...connection.tools);
    }
    this.logger.log({
      message: 'MCP tools refreshed',
      context: { totalToolCount: this.allTools.length },
    });
  }

  /**
   * Disconnect from all servers
   */
  async disconnectAll(): Promise<void> {
    for (const [name, connection] of this.connections) {
      try {
        await connection.client.close();
        this.logger.log({
          message: 'MCP server disconnected',
          context: { serverName: name },
        });
      } catch (error) {
        this.logger.error({
          message: 'Error disconnecting from MCP server',
          error: error instanceof Error ? error : new Error(String(error)),
          context: { serverName: name },
        });
      }
    }
    this.connections.clear();
    this.allTools = [];
  }

  /**
   * Get all tools from all connected servers
   */
  getTools(): MCPTool[] {
    return this.allTools;
  }

  /**
   * Get tools from a specific server
   */
  getToolsFromServer(serverName: string): MCPTool[] {
    const connection = this.connections.get(serverName);
    return connection ? connection.tools : [];
  }

  /**
   * Call a tool - automatically routes to the correct server
   */
  async callTool(
    name: string,
    args: Record<string, unknown>,
  ): Promise<unknown> {
    // Find the tool and its server
    const tool = this.allTools.find((t) => t.name === name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }

    const connection = this.connections.get(tool.serverName);
    if (!connection) {
      throw new Error(`Server not connected: ${tool.serverName}`);
    }

    // Clean up args: remove empty strings and null values for optional params
    const cleanedArgs: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(args)) {
      // Skip empty strings and null values
      if (value === '' || value === null || value === undefined) {
        continue;
      }
      cleanedArgs[key] = value;
    }

    this.logger.log({
      message: 'Calling MCP tool',
      context: {
        toolName: name,
        serverName: tool.serverName,
        args: JSON.stringify(cleanedArgs).substring(0, 200),
      },
    });

    const startTime = Date.now();
    const result = (await connection.client.callTool({
      name,
      arguments: cleanedArgs,
    })) as ToolResult;

    this.logger.log({
      message: 'MCP tool call completed',
      context: {
        toolName: name,
        serverName: tool.serverName,
        durationMs: Date.now() - startTime,
      },
    });

    // Parse the text content from the result
    const textContent = result.content.find(
      (c): c is TextContent => c.type === 'text',
    );
    if (textContent) {
      try {
        return JSON.parse(textContent.text);
      } catch {
        return textContent.text;
      }
    }

    return result.content;
  }

  /**
   * Get connected server names
   */
  getConnectedServers(): string[] {
    return Array.from(this.connections.keys());
  }

  /**
   * Check if a specific server is connected
   */
  isServerConnected(serverName: string): boolean {
    return this.connections.has(serverName);
  }
}
