import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {
  getMcpServers,
  IMcpServerConfig,
  IMcpConfig,
} from '../config/mcp-servers.config';
import { LoggerService } from '../../telemetry/logger/logger.service';

interface ITextContent {
  type: 'text';
  text: string;
}

interface IToolResult {
  content: Array<ITextContent | { type: string }>;
}

export interface IMCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  serverName: string;
}

interface IStdioConnection {
  type: 'stdio';
  config: IMcpServerConfig;
  client: Client;
  transport: StdioClientTransport;
  tools: IMCPTool[];
}

interface IHttpConnection {
  type: 'http';
  config: IMcpServerConfig;
  tools: IMCPTool[];
}

type McpConnection = IStdioConnection | IHttpConnection;

interface ICallToolParams {
  name: string;
  args: Record<string, unknown>;
  userToken?: string;
}

@Injectable()
export class McpClientService implements OnModuleInit, OnModuleDestroy {
  private connections: Map<string, McpConnection> = new Map();
  private allTools: IMCPTool[] = [];
  private mcpConfig: IMcpConfig;

  constructor(
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(McpClientService.name);
    this.mcpConfig = {
      useOboFlow: this.configService.get<boolean>('mcp.useOboFlow') ?? false,
      azureTenantId: this.configService.get<string>('mcp.azureTenantId') ?? '',
      entraAppClientId:
        this.configService.get<string>('mcp.entraAppClientId') ?? '',
      userManagedIdentityClientId:
        this.configService.get<string>('mcp.userManagedIdentityClientId') ?? '',
      fabricApiBaseUrl:
        this.configService.get<string>('mcp.fabricApiBaseUrl') ??
        'https://api.fabric.microsoft.com/v1',
      mcpServerUrl:
        this.configService.get<string>('mcp.mcpServerUrl') ??
        'http://localhost:3001/mcp',
    };
  }

  async onModuleInit(): Promise<void> {
    await this.connectAll();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnectAll();
  }

  async connectAll(): Promise<void> {
    const enabledServers = getMcpServers({ config: this.mcpConfig }).filter(
      (s) => s.enabled,
    );
    this.logger.log({
      message: 'Connecting to MCP servers',
      context: {
        serverCount: enabledServers.length,
        servers: enabledServers.map((s) => s.name).join(', '),
        useOboFlow: this.mcpConfig.useOboFlow,
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

  private async connectToServer(config: IMcpServerConfig): Promise<void> {
    if (config.transport === 'http') {
      await this.connectToHttpServer(config);
    } else {
      await this.connectToStdioServer(config);
    }
  }

  private async connectToHttpServer(config: IMcpServerConfig): Promise<void> {
    if (!config.httpUrl) {
      throw new Error(`HTTP URL is required for HTTP transport: ${config.name}`);
    }

    this.logger.log({
      message: 'Registering MCP HTTP server (will connect on first request with user token)',
      context: {
        serverName: config.name,
        httpUrl: config.httpUrl,
      },
    });

    this.connections.set(config.name, {
      type: 'http',
      config,
      tools: [],
    });
  }

  private async discoverHttpTools(args: {
    connection: IHttpConnection;
    userToken: string;
  }): Promise<void> {
    const { connection, userToken } = args;

    if (connection.tools.length > 0) {
      return;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`,
    };

    const transport = new StreamableHTTPClientTransport(
      new URL(connection.config.httpUrl!),
      { requestInit: { headers } },
    );

    const client = new Client({
      name: `agent-client-${connection.config.name}-discovery`,
      version: '1.0.0',
    });

    try {
      await client.connect(transport);

      const result = await client.listTools();
      connection.tools = result.tools.map((tool) => ({
        name: tool.name,
        description: tool.description || '',
        inputSchema: tool.inputSchema as Record<string, unknown>,
        serverName: connection.config.name,
      }));

      this.refreshAllTools();

      this.logger.log({
        message: 'MCP HTTP server tools discovered',
        context: {
          serverName: connection.config.name,
          toolCount: connection.tools.length,
          tools: connection.tools.map((t) => t.name).join(', '),
        },
      });
    } finally {
      await client.close();
    }
  }

  private async connectToStdioServer(config: IMcpServerConfig): Promise<void> {
    if (!config.command || !config.args) {
      throw new Error(
        `Command and args are required for stdio transport: ${config.name}`,
      );
    }

    this.logger.log({
      message: 'Connecting to MCP stdio server',
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

    try {
      await client.connect(transport);

      const result = await client.listTools();
      const tools: IMCPTool[] = result.tools.map((tool) => ({
        name: tool.name,
        description: tool.description || '',
        inputSchema: tool.inputSchema as Record<string, unknown>,
        serverName: config.name,
      }));

      this.logger.log({
        message: 'MCP stdio server tools discovered',
        context: {
          serverName: config.name,
          toolCount: tools.length,
          tools: tools.map((t) => t.name).join(', '),
        },
      });

      this.connections.set(config.name, {
        type: 'stdio',
        config,
        client,
        transport,
        tools,
      });
    } catch (error) {
      this.logger.error({
        message: 'Failed to connect to MCP stdio server',
        error: error instanceof Error ? error : new Error(String(error)),
        context: { serverName: config.name },
      });
      throw error;
    }
  }

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

  async disconnectAll(): Promise<void> {
    for (const [name, connection] of this.connections) {
      try {
        if (connection.type === 'stdio') {
          await connection.client.close();
        }
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

  getTools(): IMCPTool[] {
    return this.allTools;
  }

  async getToolsWithToken(args: { userToken?: string }): Promise<IMCPTool[]> {
    const { userToken } = args;

    if (userToken) {
      for (const connection of this.connections.values()) {
        if (connection.type === 'http' && connection.tools.length === 0) {
          await this.discoverHttpTools({ connection, userToken });
        }
      }
    }

    return this.allTools;
  }

  getToolsFromServer(serverName: string): IMCPTool[] {
    const connection = this.connections.get(serverName);
    return connection ? connection.tools : [];
  }

  async callTool(params: ICallToolParams): Promise<unknown> {
    const { name, args, userToken } = params;

    if (userToken) {
      for (const connection of this.connections.values()) {
        if (connection.type === 'http' && connection.tools.length === 0) {
          await this.discoverHttpTools({ connection, userToken });
        }
      }
    }

    const tool = this.allTools.find((t) => t.name === name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }

    const connection = this.connections.get(tool.serverName);
    if (!connection) {
      throw new Error(`Server not connected: ${tool.serverName}`);
    }

    const cleanedArgs = this.cleanArgs(args);

    this.logger.log({
      message: 'Calling MCP tool',
      context: {
        toolName: name,
        serverName: tool.serverName,
        transportType: connection.type,
        hasUserToken: !!userToken,
        args: JSON.stringify(cleanedArgs).substring(0, 200),
      },
    });

    const startTime = Date.now();
    let result: IToolResult;

    if (connection.type === 'http') {
      result = await this.callHttpTool({
        connection,
        toolName: name,
        args: cleanedArgs,
        userToken,
      });
    } else {
      result = await this.callStdioTool({
        connection,
        toolName: name,
        args: cleanedArgs,
        userToken,
      });
    }

    this.logger.log({
      message: 'MCP tool call completed',
      context: {
        toolName: name,
        serverName: tool.serverName,
        durationMs: Date.now() - startTime,
        resultPreview: JSON.stringify(result).substring(0, 500),
      },
    });

    return this.parseToolResult(result);
  }

  private async callHttpTool(params: {
    connection: IHttpConnection;
    toolName: string;
    args: Record<string, unknown>;
    userToken?: string;
  }): Promise<IToolResult> {
    const { connection, toolName, args, userToken } = params;

    if (!connection.config.httpUrl) {
      throw new Error('HTTP URL not configured');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
    }

    const transport = new StreamableHTTPClientTransport(
      new URL(connection.config.httpUrl),
      { requestInit: { headers } },
    );

    const client = new Client({
      name: `agent-client-${connection.config.name}-request`,
      version: '1.0.0',
    });

    try {
      await client.connect(transport);

      const result = (await client.callTool({
        name: toolName,
        arguments: args,
      })) as IToolResult;

      return result;
    } catch (error) {
      this.logger.error({
        message: 'MCP HTTP tool call failed',
        error: error instanceof Error ? error : new Error(String(error)),
        context: {
          toolName,
          serverName: connection.config.name,
        },
      });
      throw error;
    } finally {
      await client.close();
    }
  }

  private async callStdioTool(params: {
    connection: IStdioConnection;
    toolName: string;
    args: Record<string, unknown>;
    userToken?: string;
  }): Promise<IToolResult> {
    const { connection, toolName, args, userToken } = params;

    const toolArgs = { ...args };
    if (userToken && this.mcpConfig.useOboFlow) {
      toolArgs['access_token'] = userToken;
    }

    return (await connection.client.callTool({
      name: toolName,
      arguments: toolArgs,
    })) as IToolResult;
  }

  private cleanArgs(args: Record<string, unknown>): Record<string, unknown> {
    const cleanedArgs: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(args)) {
      if (value === '' || value === null || value === undefined) {
        continue;
      }
      cleanedArgs[key] = value;
    }
    return cleanedArgs;
  }

  private parseToolResult(result: IToolResult): unknown {
    const textContent = result.content.find(
      (c): c is ITextContent => c.type === 'text',
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

  getConnectedServers(): string[] {
    return Array.from(this.connections.keys());
  }

  isServerConnected(serverName: string): boolean {
    return this.connections.has(serverName);
  }

  isUsingOboFlow(): boolean {
    return this.mcpConfig.useOboFlow;
  }
}
