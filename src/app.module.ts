import { CreateUserUseCase } from '@application/user/create-user.usecase';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

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
