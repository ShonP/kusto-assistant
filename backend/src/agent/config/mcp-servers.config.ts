
export interface McpServerConfig {
  name: string;
  description: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  enabled: boolean;
}

export const MCP_SERVERS: McpServerConfig[] = [
  {
    name: 'fabric-rti',
    description:
      'Microsoft Fabric Real-Time Intelligence MCP server for Kusto, Eventstreams, and Activator',
    command: 'uvx',
    args: ['microsoft-fabric-rti-mcp', '--stdio'],
    env: {
      FABRIC_API_BASE_URL: 'https://api.fabric.microsoft.com/v1',
    },
    enabled: true,
  },
];
