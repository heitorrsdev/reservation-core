import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { Module } from '@nestjs/common';

import { LoginUseCase } from './auth/login.usecase';
import { LogoutUseCase } from './auth/logout.usecase';
import { RefreshTokenUseCase } from './auth/refresh-token.usecase';
import { CreateBarberUseCase } from './barber/create-barber.usecase';
import { CreateReservationUseCase } from './reservation/create-reservation.usecase';
import { CreateUserUseCase } from './user/create-user.usecase';

@Module({
  imports: [InfrastructureModule],
  providers: [
    CreateUserUseCase,
    CreateBarberUseCase,
    CreateReservationUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
  ],
  exports: [
    CreateUserUseCase,
    CreateBarberUseCase,
    CreateReservationUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
  ],
})
export class ApplicationModule {}
