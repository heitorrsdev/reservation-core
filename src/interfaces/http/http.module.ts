import { ApplicationModule } from '@application/application.module';
import { JwtAuthGuard } from '@infrastructure/auth/jwt-auth.guard';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';

import { AuthController } from './auth/auth.controller';
import { BarberController } from './barber/barber.controller';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { HealthModule } from './health/health.module';
import { ReservationController } from './reservation/reservation.controller';
import { UserController } from './user/user.controller';

@Module({
  imports: [ApplicationModule, HealthModule],
  controllers: [
    AuthController,
    UserController,
    BarberController,
    ReservationController,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class HttpModule {}
