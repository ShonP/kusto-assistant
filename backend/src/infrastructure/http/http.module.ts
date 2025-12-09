import { Module, Global } from '@nestjs/common';
import { HttpModule as NestHttpModule } from '@nestjs/axios';
import { HttpService } from './http.service';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    NestHttpModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        timeout: configService.get<number>('http.client.timeout') ?? 10000,
        maxRedirects: 5,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [HttpService],
  exports: [HttpService],
})
export class HttpModule {}
