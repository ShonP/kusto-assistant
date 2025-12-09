import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../../telemetry/logger/logger.service';
import { ClsService } from 'nestjs-cls';

interface IErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
  correlationId?: string;
  requestId?: string;
  userId?: string;
  errors?: unknown[];
}

interface IHttpExceptionResponse {
  message: string;
  errors?: unknown[];
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: LoggerService,
    private readonly cls: ClsService,
  ) {}

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const correlationId = this.cls.get<string>('correlationId');
    const requestId = this.cls.get<string>('requestId');
    const userId = this.cls.get<string>('userId');

    const isHttpException = exception instanceof HttpException;
    const statusCode = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = isHttpException ? exception.getResponse() : null;

    let message = exception.message || 'Internal server error';
    let validationErrors: unknown[] | undefined;

    if (isHttpException && exceptionResponse) {
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const response = exceptionResponse as IHttpExceptionResponse;
        message = response.message || exception.message;
        validationErrors = response.errors;
      }
    }

    const errorName = exception.name || 'Error';

    const errorResponse: IErrorResponse = {
      statusCode,
      message,
      error: errorName,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(correlationId && { correlationId }),
      ...(requestId && { requestId }),
      ...(userId && { userId }),
      ...(validationErrors && { errors: validationErrors }),
    };

    this.logger.error({
      message: `${errorName}: ${message}`,
      error: exception,
      context: {
        statusCode,
        path: request.url,
        method: request.method,
        ...(correlationId && { correlationId }),
        ...(requestId && { requestId }),
        ...(userId && { userId }),
      },
    });

    response.status(statusCode).json(errorResponse);
  }
}
