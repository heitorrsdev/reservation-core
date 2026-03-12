import { ApplicationModule } from '@application/application.module';
import { HttpModule } from '@http/http.module';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ApplicationModule,
    InfrastructureModule,
    HttpModule,
  ],
})
export class AppModule {}
