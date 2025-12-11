export interface IMcpConfig {
  useOboFlow: boolean;
  azureTenantId: string;
  entraAppClientId: string;
  userManagedIdentityClientId: string;
  fabricApiBaseUrl: string;
  mcpServerUrl: string;
}

export type TransportType = 'stdio' | 'http';

export interface IMcpServerConfig {
  name: string;
  description: string;
  transport: TransportType;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  httpUrl?: string;
  enabled: boolean;
}

export const getMcpServers = (args: {
  config: IMcpConfig;
}): IMcpServerConfig[] => {
  const { config } = args;
  console.log({ config });

  if (config.useOboFlow) {
    // OBO flow requires HTTP transport - MCP server must be started separately
    // with USE_OBO_FLOW=true and other OBO env vars
    return [
      {
        name: 'fabric-rti',
        description:
          'Microsoft Fabric Real-Time Intelligence MCP server for Kusto, Eventstreams, and Activator',
        transport: 'http',
        httpUrl: config.mcpServerUrl,
        enabled: true,
      },
    ];
  }

  return [
    {
      name: 'fabric-rti',
      description:
        'Microsoft Fabric Real-Time Intelligence MCP server for Kusto, Eventstreams, and Activator',
      transport: 'stdio',
      command: 'uvx',
      args: ['microsoft-fabric-rti-mcp'],
      env: {
        FABRIC_API_BASE_URL: config.fabricApiBaseUrl,
      },
      enabled: true,
    },
  ];
};
