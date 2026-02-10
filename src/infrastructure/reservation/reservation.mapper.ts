import { Reservation } from '@domain/reservation/reservation.entity';

type ReservationRow = {
  id: string;
  userId: string;
  barberId: string;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
};

export class ReservationMapper {
  static toDomain(row: ReservationRow): Reservation {
    return Reservation.create({
      id: row.id,
      userId: row.userId,
      barberId: row.barberId,
      startTime: row.startTime,
      endTime: row.endTime,
    });
  }

  static toPersistence(reservation: Reservation): ReservationRow {
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
