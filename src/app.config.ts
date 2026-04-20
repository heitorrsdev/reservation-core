import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

function parseAllowedOrigins(allowedOrigins?: string): boolean | string[] {
  if (!allowedOrigins) {
    return false;
  }
  if (allowedOrigins === 'true' || allowedOrigins === '*') {
    return true;
  }
  return allowedOrigins.split(',').map((o) => o.trim());
}

export function configureApp(app: INestApplication) {
  app.enableShutdownHooks();

  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV === 'production' ? undefined : false,
    }),
  );

  app.use(cookieParser());
  app.enableCors({
    origin: parseAllowedOrigins(process.env.ALLOWED_ORIGINS),
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
