import { ReservationConflictError } from '@domain/reservation/errors/reservation-conflict.error';
import { Reservation } from '@domain/reservation/reservation.entity';
import { ReservationRepository } from '@domain/reservation/reservation.repository';

import { db } from '../database/drizzle';
import { reservations } from '../database/schema/reservation';

export class ReservationDrizzleRepository implements ReservationRepository {
  async save(reservationEntity: Reservation): Promise<void> {
    try {
      await db.insert(reservations).values({
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
