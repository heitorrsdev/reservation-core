import { ApplicationModule } from '@application/application.module';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { HttpModule } from './interfaces/http/http.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ApplicationModule,
    InfrastructureModule,
    HttpModule,
  ],
})
export class AppModule {}
