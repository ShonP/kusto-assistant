import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { LoggerService } from '../../telemetry/logger/logger.service';
import { MetricsService } from '../../telemetry/logger/metrics.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    const controllerName = context.getClass().name;
    const handlerName = context.getHandler().name;

    this.logger.setContext(controllerName);
    this.logger.log({
      message: `Incoming ${method} ${url}`,
      context: {
        method,
        url,
        ip,
        userAgent,
        controller: controllerName,
        handler: handlerName,
      },
    });

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const { statusCode } = response;

          this.logger.log({
            message: `${method} ${url} ${statusCode} - ${duration}ms`,
            context: {
              method,
              url,
              statusCode,
              duration,
              ip,
            },
          });

          this.metrics.recordHistogram({
            name: 'http.request.duration',
            value: duration,
            attributes: {
              method,
              path: url,
              statusCode: statusCode.toString(),
            },
          });

          this.metrics.incrementCounter({
            name: 'http.request.total',
            attributes: {
              method,
              path: url,
              statusCode: statusCode.toString(),
            },
          });
        },
        error: (error: Error) => {
          const duration = Date.now() - startTime;
          const { statusCode } = response;

          this.logger.error({
            message: `${method} ${url} ${statusCode} - ${duration}ms - Error: ${error.message}`,
            error,
            context: {
              method,
              url,
              statusCode,
              duration,
              ip,
            },
          });

          this.metrics.recordHistogram({
            name: 'http.request.duration',
            value: duration,
            attributes: {
              method,
              path: url,
              statusCode: statusCode.toString(),
              error: 'true',
            },
          });

          this.metrics.incrementCounter({
            name: 'http.request.errors',
            attributes: {
              method,
              path: url,
              errorType: error.name,
            },
          });
        },
      }),
    );
  }
}
