export interface IRequestContext {
  correlationId: string;
  requestId: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
}
