import { ReservationConflictError } from '@domain/reservation/errors/reservation-conflict.error';
import { Reservation } from '@domain/reservation/reservation.entity';
import { ReservationRepository } from '@domain/reservation/reservation.repository';
import { DrizzleClient } from '@infrastructure/database/database.provider';
import { DATABASE } from '@infrastructure/database/database.token';
import { PostgresErrorMapper } from '@infrastructure/database/postgres-error.mapper';
import { reservations } from '@infrastructure/database/schema/reservation';
import { Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { ReservationMapper } from './reservation.mapper';

export class ReservationDrizzleRepository implements ReservationRepository {
  constructor(@Inject(DATABASE) private readonly db: DrizzleClient) {}

  async save(reservation: Reservation): Promise<void> {
    try {
      const data = ReservationMapper.toPersistence(reservation);
      await this.db.insert(reservations).values(data);
    } catch (error: unknown) {
      if (PostgresErrorMapper.isExclusionViolation(error)) {
        throw new ReservationConflictError();
      }

      throw error;
    }
  }

  async findById(id: string): Promise<Reservation | null> {
    const [row] = await this.db
      .select()
      .from(reservations)
      .where(eq(reservations.id, id));

    return ReservationMapper.toDomain(row);
  }
}
