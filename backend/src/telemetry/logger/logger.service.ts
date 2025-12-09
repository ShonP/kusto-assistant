import { Injectable, ConsoleLogger, Scope, Optional } from '@nestjs/common';
import { ILogContext } from './interfaces/logger.interface';
import * as opentelemetry from '@opentelemetry/api';
import { ClsService } from 'nestjs-cls';

enum SeverityNumber {
  TRACE = 1,
  DEBUG = 5,
  INFO = 9,
  WARN = 13,
  ERROR = 17,
  FATAL = 21,
}

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService extends ConsoleLogger {
  private tracer: opentelemetry.Tracer;
  private contextName?: string;

  constructor(@Optional() private readonly cls?: ClsService) {
    super();
    this.tracer = opentelemetry.trace.getTracer('logger-service');
  }

  override setContext(context: string): void {
    this.contextName = context;
    super.setContext(context);
  }

  private enrichContext(context?: ILogContext): ILogContext {
    if (!this.cls) {
      return context || {};
    }

    const correlationId = this.cls.get<string>('correlationId');
    const requestId = this.cls.get<string>('requestId');
    const userId = this.cls.get<string>('userId');
    const userEmail = this.cls.get<string>('userEmail');

    return {
      ...context,
      ...(correlationId && { correlationId }),
      ...(requestId && { requestId }),
      ...(userId && { userId }),
      ...(userEmail && { userEmail }),
    };
  }

  private addEventToCurrentSpan(args: {
    name: string;
    severityNumber: SeverityNumber;
    severityText: string;
    attributes: ILogContext;
  }): void {
    try {
      const currentSpan = opentelemetry.trace.getActiveSpan();
      if (currentSpan && currentSpan.isRecording()) {
        currentSpan.addEvent(args.name, {
          ...args.attributes,
          'log.severity': args.severityText,
          'log.severity.number': args.severityNumber,
        });
      }
    } catch {
      // Silently ignore span errors to prevent pollution of logs
    }
  }

  log(args: { message: string; context?: ILogContext }): void {
    const enrichedContext = this.enrichContext(args.context);

    this.addEventToCurrentSpan({
      name: args.message,
      severityNumber: SeverityNumber.INFO,
      severityText: 'INFO',
      attributes: enrichedContext,
    });

    const contextStr = Object.entries(enrichedContext)
      .map(([key, value]) => `${key}=${value}`)
      .join(' ');

    const contextPrefix = this.contextName ? `[${this.contextName}] ` : '';
    super.log(`${contextPrefix}${args.message} ${contextStr ? `[${contextStr}]` : ''}`);
  }

  error(args: { message: string; error?: Error; context?: ILogContext }): void {
    const enrichedContext = this.enrichContext(args.context);

    const attributes = {
      ...enrichedContext,
      ...(args.error && {
        'error.type': args.error.name,
        'error.message': args.error.message,
        'error.stack': args.error.stack,
      }),
    };

    this.addEventToCurrentSpan({
      name: args.message,
      severityNumber: SeverityNumber.ERROR,
      severityText: 'ERROR',
      attributes,
    });

    if (args.error) {
      try {
        const currentSpan = opentelemetry.trace.getActiveSpan();
        if (currentSpan && currentSpan.isRecording()) {
          currentSpan.recordException(args.error);
          currentSpan.setStatus({
            code: opentelemetry.SpanStatusCode.ERROR,
            message: args.error.message,
          });
        }
      } catch {
        // Silently ignore span errors
      }
    }

    const contextStr = Object.entries(enrichedContext)
      .map(([key, value]) => `${key}=${value}`)
      .join(' ');

    const contextPrefix = this.contextName ? `[${this.contextName}] ` : '';
    super.error(
      `${contextPrefix}${args.message} ${contextStr ? `[${contextStr}]` : ''}`,
      args.error?.stack,
    );
  }

  warn(args: { message: string; context?: ILogContext }): void {
    const enrichedContext = this.enrichContext(args.context);

    this.addEventToCurrentSpan({
      name: args.message,
      severityNumber: SeverityNumber.WARN,
      severityText: 'WARN',
      attributes: enrichedContext,
    });

    const contextStr = Object.entries(enrichedContext)
      .map(([key, value]) => `${key}=${value}`)
      .join(' ');

    const contextPrefix = this.contextName ? `[${this.contextName}] ` : '';
    super.warn(`${contextPrefix}${args.message} ${contextStr ? `[${contextStr}]` : ''}`);
  }

  debug(args: { message: string; context?: ILogContext }): void {
    const enrichedContext = this.enrichContext(args.context);

    this.addEventToCurrentSpan({
      name: args.message,
      severityNumber: SeverityNumber.DEBUG,
      severityText: 'DEBUG',
      attributes: enrichedContext,
    });

    const contextStr = Object.entries(enrichedContext)
      .map(([key, value]) => `${key}=${value}`)
      .join(' ');

    const contextPrefix = this.contextName ? `[${this.contextName}] ` : '';
    super.debug(`${contextPrefix}${args.message} ${contextStr ? `[${contextStr}]` : ''}`);
  }

  verbose(args: { message: string; context?: ILogContext }): void {
    const enrichedContext = this.enrichContext(args.context);

    this.addEventToCurrentSpan({
      name: args.message,
      severityNumber: SeverityNumber.TRACE,
      severityText: 'TRACE',
      attributes: enrichedContext,
    });

    const contextStr = Object.entries(enrichedContext)
      .map(([key, value]) => `${key}=${value}`)
      .join(' ');

    super.verbose(`${args.message} ${contextStr ? `[${contextStr}]` : ''}`);
  }
}
