import { Module } from '@nestjs/common';

import { RESERVATION_REPOSITORY } from '@application/reservation/reservation-repository.token';

import { ReservationDrizzleRepository } from '@infrastructure/reservation/reservation.drizzle-repository';

import { createDatabase } from './database.provider';
import { DATABASE } from './database.token';

@Module({
  providers: [
    {
      provide: DATABASE,
      useFactory: createDatabase,
    },
    {
      provide: RESERVATION_REPOSITORY,
      useClass: ReservationDrizzleRepository,
    },
  ],
  exports: [DATABASE, ReservationDrizzleRepository],
})
export class DatabaseModule {}
