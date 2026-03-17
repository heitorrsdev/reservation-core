import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { Module } from '@nestjs/common';

import { CreateBarberUseCase } from './barber/create-barber.usecase';
import { CreateReservationUseCase } from './reservation/create-reservation.usecase';
import { CreateUserUseCase } from './user/create-user.usecase';

@Module({
  imports: [InfrastructureModule],
  providers: [CreateUserUseCase, CreateBarberUseCase, CreateReservationUseCase],
  exports: [CreateUserUseCase, CreateBarberUseCase, CreateReservationUseCase],
})
export class ApplicationModule {}
