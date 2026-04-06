import { BarberNotFoundError } from '@domain/barber/errors/barber-not-found.error';
import { DependencyNotFoundError } from '@domain/errors/dependency-not-found.error';
import { ReservationConflictError } from '@domain/reservation/errors/reservation-conflict.error';
import { Reservation } from '@domain/reservation/reservation.entity';
import { ReservationRepository } from '@domain/reservation/reservation.repository';
import { UserNotFoundError } from '@domain/user/errors/user-not-found.error';
import { DrizzleClient } from '@infrastructure/database/database.provider';
import { DATABASE } from '@infrastructure/database/database.token';
import { PostgresErrorMapper } from '@infrastructure/database/postgres-error.mapper';
import { reservations } from '@infrastructure/database/schema/reservation';
import { Inject } from '@nestjs/common';
import { and, asc, count, eq, gte, lte } from 'drizzle-orm';

import { ReservationMapper } from './reservation.mapper';

export class ReservationDrizzleRepository implements ReservationRepository {
  constructor(@Inject(DATABASE) private readonly db: DrizzleClient) {}

  async save(reservation: Reservation): Promise<void> {
    try {
      const data = ReservationMapper.toPersistence(reservation);

      await this.db.insert(reservations).values(data).onConflictDoUpdate({
        target: reservations.id,
        set: data,
      });
    } catch (error: unknown) {
      if (PostgresErrorMapper.isConcurrencyError(error)) {
        throw new ReservationConflictError();
      }

      if (PostgresErrorMapper.isForeignKeyViolation(error)) {
        const details = PostgresErrorMapper.getForeignKeyDetails(error);

        if (details?.column === 'user_id') {
          throw new UserNotFoundError(details.value);
        }

        if (details?.column === 'barber_id') {
          throw new BarberNotFoundError(details.value);
        }

        throw new DependencyNotFoundError('Reservation', details?.value);
      }

      throw error;
    }
  }

  async findById(id: string): Promise<Reservation | null> {
    const result = await this.db
      .select()
      .from(reservations)
      .where(eq(reservations.id, id));

    if (!result.length) return null;

    return ReservationMapper.toDomain(result[0]);
  }

  async findByBarberId(
    barberId: string,
    limit: number,
    offset: number,
    startTime?: Date,
    endTime?: Date,
  ): Promise<[Reservation[], number]> {
    const conditions = [
      eq(reservations.barberId, barberId),
      eq(reservations.status, 'active'),
    ];

    if (startTime) conditions.push(gte(reservations.startTime, startTime));
    if (endTime) conditions.push(lte(reservations.endTime, endTime));

    const whereClause = and(...conditions);

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(reservations)
        .where(whereClause)
        .orderBy(asc(reservations.startTime))
        .limit(limit)
        .offset(offset),
      this.db.select({ count: count() }).from(reservations).where(whereClause),
    ]);

    const items = rows.map((row) => ReservationMapper.toDomain(row));
    const total = Number(countResult[0].count);

    return [items, total];
  }

  async findManyByUserId(userId: string): Promise<Reservation[]> {
    const rows = await this.db
      .select()
      .from(reservations)
      .where(eq(reservations.userId, userId))
      .orderBy(asc(reservations.startTime));

    return rows.map((row) => ReservationMapper.toDomain(row));
  }
}
