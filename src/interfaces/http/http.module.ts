import { ApplicationModule } from '@application/application.module';
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { BarberController } from './barber/barber.controller';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { ReservationController } from './reservation/reservation.controller';
import { UserController } from './user/user.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [UserController, BarberController, ReservationController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class HttpModule {}
