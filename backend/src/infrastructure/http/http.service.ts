import { Injectable, HttpException, HttpStatus, Optional } from '@nestjs/common';
import { HttpService as NestHttpService } from '@nestjs/axios';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import { ConfigService } from '@nestjs/config';
import { ClsService } from 'nestjs-cls';
import { LoggerService } from '../../telemetry/logger/logger.service';
import { MetricsService } from '../../telemetry/logger/metrics.service';
import { IHttpRequestConfig, IHttpResponse } from './http.interface';
import { catchError, firstValueFrom, map } from 'rxjs';

@Injectable()
export class HttpService {
  private readonly defaultRetries: number;

  constructor(
    private readonly nestHttpService: NestHttpService,
    private readonly configService: ConfigService,
    @Optional() private readonly cls?: ClsService,
    @Optional() private readonly logger?: LoggerService,
    @Optional() private readonly metrics?: MetricsService,
  ) {
    this.defaultRetries =
      this.configService.get<number>('http.client.retries') ?? 3;

    this.setupRetry();
    this.setupInterceptors();
  }

  private setupRetry(): void {
    const axiosInstance = this.nestHttpService.axiosRef;

    axiosRetry(axiosInstance, {
      retries: this.defaultRetries,
      retryDelay: (retryCount) => axiosRetry.exponentialDelay(retryCount),
      retryCondition: (error: AxiosError) => {
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          (error.response?.status ?? 0) >= 500
        );
      },
      onRetry: (retryCount, error, requestConfig) => {
        this.logger?.warn({
          message: `Retrying HTTP request (${retryCount}/${this.defaultRetries})`,
          context: {
            url: requestConfig.url,
            method: requestConfig.method,
            retryCount,
            error: error.message,
          },
        });
      },
    });
  }

  private setupInterceptors(): void {
    const axiosInstance = this.nestHttpService.axiosRef;

    axiosInstance.interceptors.request.use((config) => {
      const correlationId = this.cls?.get<string>('correlationId');
      const requestId = this.cls?.get<string>('requestId');

      if (correlationId) {
        config.headers['X-Correlation-ID'] = correlationId;
      }
      if (requestId) {
        config.headers['X-Request-ID'] = requestId;
      }

      this.logger?.log({
        message: `Outgoing HTTP ${config.method?.toUpperCase()} ${config.url}`,
        context: {
          method: config.method,
          url: config.url,
          correlationId,
        },
      });

      return config;
    });

    axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        this.metrics?.incrementCounter({
          name: 'http.client.requests.total',
          attributes: {
            method: response.config.method ?? 'unknown',
            status: response.status.toString(),
            success: 'true',
          },
        });

        return response;
      },
      (error: AxiosError) => {
        this.metrics?.incrementCounter({
          name: 'http.client.requests.total',
          attributes: {
            method: error.config?.method ?? 'unknown',
            status: error.response?.status?.toString() ?? '0',
            success: 'false',
          },
        });

        this.logger?.error({
          message: `HTTP request failed: ${error.message}`,
          error: error as Error,
          context: {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
          },
        });

        return Promise.reject(error);
      },
    );
  }

  async request<T = unknown>(
    config: IHttpRequestConfig,
  ): Promise<IHttpResponse<T>> {
    const startTime = Date.now();

    try {
      const axiosConfig: AxiosRequestConfig = {
        url: config.url,
        method: config.method,
        headers: config.headers,
        params: config.params,
        data: config.data,
        timeout: config.timeout,
      };

      const response = await firstValueFrom(
        this.nestHttpService.request<T>(axiosConfig).pipe(
          map((res) => res),
          catchError((error: AxiosError) => {
            throw error;
          }),
        ),
      );

      const duration = Date.now() - startTime;

      this.metrics?.recordHistogram({
        name: 'http.client.request.duration',
        value: duration,
        attributes: {
          method: config.method,
          status: response.status.toString(),
        },
      });

      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      this.metrics?.recordHistogram({
        name: 'http.client.request.duration',
        value: duration,
        attributes: {
          method: config.method,
          error: 'true',
        },
      });

      if (error instanceof AxiosError) {
        const errorMessage =
          typeof error.response?.data === 'string'
            ? error.response.data
            : error.message;

        throw new HttpException(
          errorMessage,
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      throw error;
    }
  }

  async get<T = unknown>(args: {
    url: string;
    params?: Record<string, unknown>;
    headers?: Record<string, string>;
    timeout?: number;
  }): Promise<IHttpResponse<T>> {
    return this.request<T>({
      url: args.url,
      method: 'GET',
      params: args.params,
      headers: args.headers,
      timeout: args.timeout,
    });
  }

  async post<T = unknown>(args: {
    url: string;
    data?: unknown;
    headers?: Record<string, string>;
    timeout?: number;
  }): Promise<IHttpResponse<T>> {
    return this.request<T>({
      url: args.url,
      method: 'POST',
      data: args.data,
      headers: args.headers,
      timeout: args.timeout,
    });
  }

  async put<T = unknown>(args: {
    url: string;
    data?: unknown;
    headers?: Record<string, string>;
    timeout?: number;
  }): Promise<IHttpResponse<T>> {
    return this.request<T>({
      url: args.url,
      method: 'PUT',
      data: args.data,
      headers: args.headers,
      timeout: args.timeout,
    });
  }

  async patch<T = unknown>(args: {
    url: string;
    data?: unknown;
    headers?: Record<string, string>;
    timeout?: number;
  }): Promise<IHttpResponse<T>> {
    return this.request<T>({
      url: args.url,
      method: 'PATCH',
      data: args.data,
      headers: args.headers,
      timeout: args.timeout,
    });
  }

  async delete<T = unknown>(args: {
    url: string;
    headers?: Record<string, string>;
    timeout?: number;
  }): Promise<IHttpResponse<T>> {
    return this.request<T>({
      url: args.url,
      method: 'DELETE',
      headers: args.headers,
      timeout: args.timeout,
    });
  }
}
