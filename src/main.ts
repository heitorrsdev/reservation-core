import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';

import { configureApp } from './app.config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = app.get(Logger);
  app.useLogger(logger);

  configureApp(app);

  const config = new DocumentBuilder()
    .setTitle('Barbershop Reservation API')
    .setDescription('API documentation for the Barbershop Reservation System.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
}

bootstrap().catch((error: unknown) => {
  console.error('❌ Application failed to start:', error);
  process.exit(1);
});
