import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for the frontend
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Agent server running on http://localhost:${port}`);
}
bootstrap();
