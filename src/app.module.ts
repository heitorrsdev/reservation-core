import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CreateUserUseCase } from '@application/user/create-user.usecase';

import { InfrastructureModule } from '@infrastructure/infrastructure.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.dev',
    }),
    InfrastructureModule,
  ],
  providers: [CreateUserUseCase],
})
export class AppModule {}
