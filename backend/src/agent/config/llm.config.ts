import { registerAs } from '@nestjs/config';

export type LlmProviderType = 'openai' | 'azure-openai-key' | 'azure-openai-identity';

export interface ILlmConfig {
  provider: LlmProviderType;
  model: string;
  openai?: {
    apiKey: string;
  };
  azureOpenai?: {
    endpoint: string;
    deployment: string;
    apiKey?: string;
    apiVersion: string;
  };
}

export const llmConfig = registerAs('llm', (): ILlmConfig => {
  const provider = (process.env.LLM_PROVIDER || 'openai') as LlmProviderType;

  const config: ILlmConfig = {
    provider,
    model: process.env.LLM_MODEL || 'gpt-5.1',
  };

  switch (provider) {
    case 'openai':
      config.openai = {
        apiKey: process.env.OPENAI_API_KEY || '',
      };
      break;

    case 'azure-openai-key':
      config.azureOpenai = {
        endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
        deployment: process.env.AZURE_OPENAI_DEPLOYMENT || '',
        apiKey: process.env.AZURE_OPENAI_API_KEY || '',
        apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-08-01-preview',
      };
      break;

    case 'azure-openai-identity':
      config.azureOpenai = {
        endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
        deployment: process.env.AZURE_OPENAI_DEPLOYMENT || '',
        apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-08-01-preview',
      };
      break;
  }

  return config;
});
