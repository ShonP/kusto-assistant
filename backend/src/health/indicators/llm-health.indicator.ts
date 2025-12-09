import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { LlmClientService } from '../../agent/services/llm-client.service';

@Injectable()
export class LlmHealthIndicator extends HealthIndicator {
  constructor(private readonly llmClient: LlmClientService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const client = this.llmClient.getClient();
      const model = this.llmClient.getModel();
      const isAzure = this.llmClient.isAzureProvider();

      const response = await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: 'Reply with: ok' }],
        max_completion_tokens: 10,
      });

      const isHealthy = !!response.id;

      const result = this.getStatus(key, isHealthy, {
        provider: isAzure ? 'azure-openai' : 'openai',
        model,
        responseId: response.id,
      });

      if (isHealthy) {
        return result;
      }

      throw new HealthCheckError('LLM health check failed', result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new HealthCheckError(
        'LLM health check failed',
        this.getStatus(key, false, {
          error: errorMessage,
        }),
      );
    }
  }
}
