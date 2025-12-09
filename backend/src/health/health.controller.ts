import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { LlmHealthIndicator } from './indicators/llm-health.indicator';
import * as os from 'os';
import { Response } from 'express';

interface IHealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  version: string;
  info?: Record<string, unknown>;
  error?: Record<string, unknown>;
  details?: Record<string, unknown>;
}

@Controller('health')
export class HealthController {
  private readonly memoryHeapThreshold: number;
  private readonly memoryRssThreshold: number;
  private readonly imageTag: string;

  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly llmHealth: LlmHealthIndicator,
  ) {
    const totalMemory = os.totalmem();
    this.memoryHeapThreshold = totalMemory * 0.75;
    this.memoryRssThreshold = totalMemory * 0.9;
    this.imageTag = process.env.IMAGE_TAG || 'unknown';
  }

  @Get()
  @HealthCheck()
  async getHealth(): Promise<IHealthResponse> {
    const checks = [
      {
        name: 'memory_heap',
        fn: () =>
          this.memory.checkHeap('memory_heap', this.memoryHeapThreshold),
      },
      {
        name: 'memory_rss',
        fn: () => this.memory.checkRSS('memory_rss', this.memoryRssThreshold),
      },
      {
        name: 'storage',
        fn: () =>
          this.disk.checkStorage('storage', {
            path: '/',
            thresholdPercent: 0.9,
          }),
      },
      { name: 'llm', fn: () => this.llmHealth.isHealthy('llm') },
    ];

    const results: Record<string, unknown> = {};
    const errors: Record<string, unknown> = {};
    let hasError = false;

    await Promise.all(
      checks.map(async (check) => {
        try {
          const result = await check.fn();
          Object.assign(results, result);
        } catch (error) {
          hasError = true;
          errors[check.name] = {
            status: 'down',
            error: error instanceof Error ? error.message : String(error),
          };
        }
      }),
    );

    return {
      status: hasError ? 'degraded' : 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: this.imageTag,
      details: { ...results, ...errors },
    };
  }

  @Get('ready')
  @HealthCheck()
  async checkReadiness() {
    const result = await this.health.check([
      () => this.memory.checkHeap('memory_heap', this.memoryHeapThreshold),
      () => this.memory.checkRSS('memory_rss', this.memoryRssThreshold),
    ]);

    return {
      ...result,
      version: this.imageTag,
    };
  }

  @Get('live')
  @HealthCheck()
  async checkLiveness() {
    const result = await this.health.check([
      () => this.memory.checkHeap('memory_heap', this.memoryHeapThreshold),
      () => this.memory.checkRSS('memory_rss', this.memoryRssThreshold),
      () =>
        this.disk.checkStorage('storage', {
          path: '/',
          thresholdPercent: 0.9,
        }),
    ]);

    return {
      ...result,
      version: this.imageTag,
    };
  }

  @Get('llm')
  @HealthCheck()
  async checkLlm() {
    const result = await this.health.check([
      () => this.llmHealth.isHealthy('llm'),
    ]);

    return {
      ...result,
      version: this.imageTag,
    };
  }

  @Get('full')
  @HealthCheck()
  async checkFull() {
    const result = await this.health.check([
      () => this.memory.checkHeap('memory_heap', this.memoryHeapThreshold),
      () => this.memory.checkRSS('memory_rss', this.memoryRssThreshold),
      () =>
        this.disk.checkStorage('storage', {
          path: '/',
          thresholdPercent: 0.9,
        }),
      () => this.llmHealth.isHealthy('llm'),
    ]);

    return {
      ...result,
      version: this.imageTag,
    };
  }
}
