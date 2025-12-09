import { Module, Global } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ClsModule, ClsService } from 'nestjs-cls';
import { GlobalExceptionFilter } from './exceptions/global-exception.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { ResponseTransformInterceptor } from './interceptors/response-transform.interceptor';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { LoggerModule } from '../telemetry/logger/logger.module';
import { ulid } from 'ulid';
import { Request, Response } from 'express';

/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        setup: (cls: ClsService, req: Request, res: Response) => {
          const newUlid = ulid();
          const correlationId =
            (req.headers['x-correlation-id'] as string) || newUlid;
          const requestId = newUlid;

          cls.set('correlationId', correlationId);
          cls.set('requestId', requestId);
          cls.set('ip', req.ip || req.socket?.remoteAddress);
          cls.set('userAgent', req.headers['user-agent']);

          res.setHeader('X-Correlation-ID', correlationId);
          res.setHeader('X-Request-ID', requestId);
        },
      },
    }),
    LoggerModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
  ],
  exports: [],
})
/* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
export class CoreModule {}
