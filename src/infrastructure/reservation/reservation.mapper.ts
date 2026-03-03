import { Reservation } from '@domain/reservation/reservation.entity';
import { reservations } from '@infrastructure/database/schema';

type ReservationSelect = typeof reservations.$inferSelect;
type ReservationInsert = typeof reservations.$inferInsert;
export class ReservationMapper {
  static toDomain(row: ReservationSelect): Reservation {
    return Reservation.create({
      id: row.id,
      userId: row.userId,
      barberId: row.barberId,
      startTime: row.startTime,
      endTime: row.endTime,
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
    };
  }
}
