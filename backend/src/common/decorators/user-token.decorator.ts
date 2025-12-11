import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IRequestWithToken } from '../guards/bearer-token.guard';

export const UserToken = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<IRequestWithToken>();
    return request.userToken;
  },
);
