import { Controller, Get } from '@nestjs/common';

interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  version: string;
}

@Controller('api/v1/health')
export class HealthController {
  @Get()
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '0.0.1',
    };
  }

  @Get('ready')
  getReadiness(): { status: string } {
    return { status: 'ready' };
  }

  @Get('live')
  getLiveness(): { status: string } {
    return { status: 'alive' };
  }
}
