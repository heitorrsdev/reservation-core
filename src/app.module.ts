import { ApplicationModule } from '@application/application.module';
import { HttpModule } from '@http/http.module';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppLoggerModule } from './infrastructure/logging/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AppLoggerModule,
    ApplicationModule,
    InfrastructureModule,
    HttpModule,
  ],
})
export class AppModule {}
