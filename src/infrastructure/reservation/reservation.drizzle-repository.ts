import { Inject } from '@nestjs/common';

import { ReservationConflictError } from '@domain/reservation/errors/reservation-conflict.error';
import { Reservation } from '@domain/reservation/reservation.entity';
import { ReservationRepository } from '@domain/reservation/reservation.repository';

import { DATABASE } from '@infrastructure/database/database.token';
import { DrizzleDatabase } from '@infrastructure/database/schema/drizzle';
import { reservations } from '@infrastructure/database/schema/reservation';

export class ReservationDrizzleRepository implements ReservationRepository {
  constructor(@Inject(DATABASE) private readonly db: DrizzleDatabase) {}
  async save(reservationEntity: Reservation): Promise<void> {
    try {
      await this.db.insert(reservations).values({
        id: reservationEntity.id,
        userId: reservationEntity.userId,
        barberId: reservationEntity.barberId,
        startTime: reservationEntity.startTime,
        endTime: reservationEntity.endTime,
      });
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === '23P01' // exclusion_violation
      ) {
        throw new ReservationConflictError();
      }

      throw error;
    }
  }
}
