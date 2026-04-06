import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { Module } from '@nestjs/common';

import { LoginUseCase } from './auth/login.usecase';
import { LogoutUseCase } from './auth/logout.usecase';
import { RefreshTokenUseCase } from './auth/refresh-token.usecase';
import { CreateBarberUseCase } from './barber/create-barber.usecase';
import { GetBarberByIdUseCase } from './barber/get-barber-by-id.usecase';
import { CancelReservationUseCase } from './reservation/cancel-reservation.usecase';
import { CreateReservationUseCase } from './reservation/create-reservation.usecase';
import { GetBarberReservationsUseCase } from './reservation/get-barber-reservations.usecase';
import { GetReservationByIdUseCase } from './reservation/get-reservation-by-id.usecase';
import { GetUserReservationsUseCase } from './reservation/get-user-reservations.usecase';
import { CreateUserUseCase } from './user/create-user.usecase';
import { GetUserMeUseCase } from './user/get-user-me.usecase';

@Module({
  imports: [InfrastructureModule],
  providers: [
    CancelReservationUseCase,
    CreateBarberUseCase,
    CreateReservationUseCase,
    CreateUserUseCase,
    GetBarberByIdUseCase,
    GetBarberReservationsUseCase,
    GetReservationByIdUseCase,
    GetUserMeUseCase,
    GetUserReservationsUseCase,
    LoginUseCase,
    LogoutUseCase,
    RefreshTokenUseCase,
  ],
  exports: [
    CancelReservationUseCase,
    CreateBarberUseCase,
    CreateReservationUseCase,
    CreateUserUseCase,
    GetBarberByIdUseCase,
    GetBarberReservationsUseCase,
    GetReservationByIdUseCase,
    GetUserMeUseCase,
    GetUserReservationsUseCase,
    LoginUseCase,
    LogoutUseCase,
    RefreshTokenUseCase,
  ],
})
export class ApplicationModule {}
