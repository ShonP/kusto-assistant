import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { ClsService } from 'nestjs-cls';

interface ITransformedResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  path: string;
  correlationId?: string;
  requestId?: string;
  userId?: string;
}

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, ITransformedResponse<T>>
{
  constructor(private readonly cls: ClsService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ITransformedResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const correlationId = this.cls.get<string>('correlationId');
    const requestId = this.cls.get<string>('requestId');
    const userId = this.cls.get<string>('userId');

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data: data as T,
        timestamp: new Date().toISOString(),
        path: request.url,
        ...(correlationId && { correlationId }),
        ...(requestId && { requestId }),
        ...(userId && { userId }),
      })),
    );
  }
}
