import { Reservation } from '@domain/reservation/reservation.entity';
import type { reservations } from '@infrastructure/database/schema';

type ReservationSelect = typeof reservations.$inferSelect;
type ReservationInsert = typeof reservations.$inferInsert;
export class ReservationMapper {
  static toDomain(row: ReservationSelect): Reservation {
    return Reservation.reconstitute({
      id: row.id,
      userId: row.userId,
      barberId: row.barberId,
      startTime: row.startTime,
      endTime: row.endTime,
      createdAt: row.createdAt,
      status: row.status,
    });
  }

  static toPersistence(reservation: Reservation): ReservationInsert {
    return {
      id: reservation.id,
      userId: reservation.userId,
      barberId: reservation.barberId,
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      createdAt: reservation.createdAt,
      status: reservation.status,
    };
  }
}
