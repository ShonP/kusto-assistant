export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),

  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
          .map((origin) => origin.trim())
          .filter(Boolean)
          .join(',')
      : '*',
  },

  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
  },

  http: {
    timeout: parseInt(process.env.HTTP_TIMEOUT || '30000', 10),
    client: {
      timeout: parseInt(process.env.HTTP_CLIENT_TIMEOUT || '10000', 10),
      retries: parseInt(process.env.HTTP_CLIENT_RETRIES || '3', 10),
    },
  },

  llm: {
    provider: process.env.LLM_PROVIDER || 'openai',
    model: process.env.LLM_MODEL || 'gpt-4o',
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
    },
    azureOpenai: {
      endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
      deployment: process.env.AZURE_OPENAI_DEPLOYMENT || '',
      apiKey: process.env.AZURE_OPENAI_API_KEY || '',
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-08-01-preview',
    },
  },

  telemetry: {
    serviceName: process.env.TELEMETRY_SERVICE_NAME || 'backend-service',
    serviceNamespace: process.env.TELEMETRY_SERVICE_NAMESPACE || 'backend',
    serviceInstanceId:
      process.env.TELEMETRY_SERVICE_INSTANCE_ID ||
      `${process.env.HOSTNAME || 'local'}-${process.pid}`,
    applicationInsightsConnectionString:
      process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
    enabled: process.env.NODE_ENV !== 'test',
    enableLiveMetrics: process.env.TELEMETRY_ENABLE_LIVE_METRICS === 'true',
    samplingRatio: parseFloat(process.env.TELEMETRY_SAMPLING_RATIO || '0.1'),
    storageDirectory: process.env.TELEMETRY_STORAGE_DIRECTORY,
  },
});
