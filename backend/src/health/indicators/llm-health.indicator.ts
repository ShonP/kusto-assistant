import { Injectable, Logger } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { LlmClientService } from '../../agent/services/llm-client.service';

@Injectable()
export class LlmHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(LlmHealthIndicator.name);

  constructor(private readonly llmClient: LlmClientService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    this.logger.log('Checking LLM health...');
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
        this.logger.log('LLM health check passed');
        return result;
      }

      this.logger.error('LLM health check failed: No response ID');
      throw new HealthCheckError('LLM health check failed', result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `LLM health check failed: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new HealthCheckError(
        'LLM health check failed',
        this.getStatus(key, false, {
          error: errorMessage,
        }),
      );
    }
  }
}
