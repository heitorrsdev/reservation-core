import type { Reservation } from './reservation.entity';

export interface ReservationRepository {
  save(reservation: Reservation): Promise<void>;
  findById(id: string): Promise<Reservation | null>;
  findByBarberId(
    barberId: string,
    limit: number,
    offset: number,
    startTime?: Date,
    endTime?: Date,
  ): Promise<[Reservation[], number]>;
  findManyByUserId(userId: string): Promise<Reservation[]>;
}
