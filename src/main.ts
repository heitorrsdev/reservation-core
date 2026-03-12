import { NestFactory } from '@nestjs/core';

import { configureApp } from './app.config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  configureApp(app);

  await app.listen(process.env.PORT || 3000);
}

bootstrap().catch((error: unknown) => {
  console.error('❌ Application failed to start:', error);
  process.exit(1);
});
