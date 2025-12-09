import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AzureOpenAI, OpenAI } from 'openai';
import {
  DefaultAzureCredential,
  getBearerTokenProvider,
} from '@azure/identity';
import { setDefaultOpenAIClient, setOpenAIAPI } from '@openai/agents';

export type LlmProviderType =
  | 'openai'
  | 'azure-openai-key'
  | 'azure-openai-identity';

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

export interface ILlmClientInfo {
  client: OpenAI | AzureOpenAI;
  model: string;
  provider: LlmProviderType;
}

@Injectable()
export class LlmClientService implements OnModuleInit {
  private readonly logger = new Logger(LlmClientService.name);
  private client: OpenAI | AzureOpenAI | null = null;
  private config: ILlmConfig | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    this.initializeClient();
  }

  private initializeClient(): void {
    this.config = this.configService.get<ILlmConfig>('llm') ?? null;

    if (!this.config) {
      throw new Error('LLM configuration not found');
    }

    this.logger.log(
      `Initializing LLM client with provider: ${this.config.provider}`,
    );

    switch (this.config.provider) {
      case 'openai':
        this.client = this.createOpenAIClient();
        break;

      case 'azure-openai-key':
        this.client = this.createAzureOpenAIKeyClient();
        break;

      case 'azure-openai-identity':
        this.client = this.createAzureOpenAIIdentityClient();
        break;
    }

    if (this.config.provider.startsWith('azure')) {
      setOpenAIAPI('chat_completions');
    }

    setDefaultOpenAIClient(this.client as OpenAI);
    this.logger.log(`LLM client initialized successfully`);
  }

  private createOpenAIClient(): OpenAI {
    if (!this.config?.openai?.apiKey) {
      throw new Error('OpenAI API key is required for openai provider');
    }

    return new OpenAI({
      apiKey: this.config.openai.apiKey,
    });
  }

  private createAzureOpenAIKeyClient(): AzureOpenAI {
    if (!this.config?.azureOpenai) {
      throw new Error('Azure OpenAI configuration is required');
    }

    const { endpoint, deployment, apiKey, apiVersion } =
      this.config.azureOpenai;

    if (!endpoint || !deployment || !apiKey) {
      throw new Error(
        'Azure OpenAI endpoint, deployment, and API key are required',
      );
    }

    return new AzureOpenAI({
      endpoint,
      deployment,
      apiKey,
      apiVersion,
    });
  }

  private createAzureOpenAIIdentityClient(): AzureOpenAI {
    if (!this.config?.azureOpenai) {
      throw new Error('Azure OpenAI configuration is required');
    }

    const { endpoint, deployment, apiVersion } = this.config.azureOpenai;

    if (!endpoint || !deployment) {
      throw new Error('Azure OpenAI endpoint and deployment are required');
    }

    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
    const credential = new DefaultAzureCredential();
    const scope = 'https://cognitiveservices.azure.com/.default';
    const azureADTokenProvider = getBearerTokenProvider(credential, scope);
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */

    return new AzureOpenAI({
      endpoint,
      deployment,
      apiVersion,
      azureADTokenProvider: azureADTokenProvider as () => Promise<string>,
    });
  }

  getClient(): OpenAI | AzureOpenAI {
    if (!this.client) {
      throw new Error('LLM client not initialized');
    }
    return this.client;
  }

  getClientInfo(): ILlmClientInfo {
    if (!this.client || !this.config) {
      throw new Error('LLM client not initialized');
    }

    return {
      client: this.client,
      model: this.config.provider.startsWith('azure')
        ? this.config.azureOpenai?.deployment || this.config.model
        : this.config.model,
      provider: this.config.provider,
    };
  }

  getModel(): string {
    if (!this.config) {
      throw new Error('LLM configuration not loaded');
    }

    if (this.config.provider.startsWith('azure')) {
      return this.config.azureOpenai?.deployment || this.config.model;
    }

    return this.config.model;
  }

  isAzureProvider(): boolean {
    return this.config?.provider.startsWith('azure') || false;
  }
}
