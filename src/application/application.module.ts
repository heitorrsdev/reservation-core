import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { Module } from '@nestjs/common';

import { LoginUseCase } from './auth/login.usecase';
import { LogoutUseCase } from './auth/logout.usecase';
import { RefreshTokenUseCase } from './auth/refresh-token.usecase';
import { CreateBarberUseCase } from './barber/create-barber.usecase';
import { GetBarberByIdUseCase } from './barber/get-barber-by-id.usecase';
import { CreateReservationUseCase } from './reservation/create-reservation.usecase';
import { CreateUserUseCase } from './user/create-user.usecase';
import { GetUserMeUseCase } from './user/get-user-me.usecase';

@Module({
  imports: [InfrastructureModule],
  providers: [
    CreateBarberUseCase,
    CreateReservationUseCase,
    CreateUserUseCase,
    GetBarberByIdUseCase,
    GetUserMeUseCase,
    LoginUseCase,
    LogoutUseCase,
    RefreshTokenUseCase,
  ],
  exports: [
    CreateBarberUseCase,
    CreateReservationUseCase,
    CreateUserUseCase,
    GetBarberByIdUseCase,
    GetUserMeUseCase,
    LoginUseCase,
    LogoutUseCase,
    RefreshTokenUseCase,
  ],
})
export class ApplicationModule {}
