import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { Module } from '@nestjs/common';

import { CreateBarberUseCase } from './barber/create-barber.usecase';
import { CreateUserUseCase } from './user/create-user.usecase';

@Module({
  imports: [InfrastructureModule],
  providers: [CreateUserUseCase, CreateBarberUseCase],
  exports: [CreateUserUseCase, CreateBarberUseCase],
})
export class ApplicationModule {}
