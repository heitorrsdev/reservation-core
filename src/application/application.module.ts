import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { Module } from '@nestjs/common';

import { CreateUserUseCase } from './user/create-user.usecase';

@Module({
  imports: [InfrastructureModule],
  providers: [CreateUserUseCase],
  exports: [CreateUserUseCase],
})
export class ApplicationModule {}
