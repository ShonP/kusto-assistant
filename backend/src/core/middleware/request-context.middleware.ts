import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';
import { ulid } from 'ulid';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(private readonly cls: ClsService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const newUlid = ulid();
    const correlationId =
      (req.headers['x-correlation-id'] as string) || newUlid;
    const requestId = newUlid;

    this.cls.set('correlationId', correlationId);
    this.cls.set('requestId', requestId);
    this.cls.set('ip', req.ip || req.socket.remoteAddress);
    this.cls.set('userAgent', req.headers['user-agent']);
    res.setHeader('X-Correlation-ID', correlationId);
    res.setHeader('X-Request-ID', requestId);

    next();
  }
}
