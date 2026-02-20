import { Inject } from '@nestjs/common';

import { ReservationConflictError } from '@domain/reservation/errors/reservation-conflict.error';
import { Reservation } from '@domain/reservation/reservation.entity';
import { ReservationRepository } from '@domain/reservation/reservation.repository';

import { Database } from '@infrastructure/database/database.provider';
import { DATABASE } from '@infrastructure/database/database.token';
import { reservations } from '@infrastructure/database/schema/reservation';

import { ReservationMapper } from './reservation.mapper';

export class ReservationDrizzleRepository implements ReservationRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async save(reservation: Reservation): Promise<void> {
    try {
      const data = ReservationMapper.toPersistence(reservation);

      await this.db.insert(reservations).values(data);
    } catch (error: unknown) {
      if (this.errorHasCode(error, '23P01')) {
        throw new ReservationConflictError();
      }

      throw error;
    }
  }

  private errorHasCode(error: unknown, code: string): boolean {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === code
    ) {
      return true;
    }
    return false;
  }
}
