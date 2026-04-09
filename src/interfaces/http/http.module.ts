import { ApplicationModule } from '@application/application.module';
import { JwtAuthGuard } from '@infrastructure/auth/jwt-auth.guard';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AuthController } from './auth/auth.controller';
import { BarberController } from './barber/barber.controller';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { HealthModule } from './health/health.module';
import { ReservationController } from './reservation/reservation.controller';
import { UserController } from './user/user.controller';

@Module({
  imports: [
    ApplicationModule,
    HealthModule,
    ThrottlerModule.forRootAsync({
      useFactory: () => [
        {
          ttl: 60000,
          limit: process.env.THROTTLE_LIMIT
            ? parseInt(process.env.THROTTLE_LIMIT, 10)
            : process.env.NODE_ENV === 'test'
              ? 10000
              : 100,
        },
      ],
    }),
  ],
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
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class HttpModule {}
