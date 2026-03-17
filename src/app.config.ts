import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';

export function configureApp(app: INestApplication) {
  app.enableCors({
    origin:
      process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()) || false,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
}
