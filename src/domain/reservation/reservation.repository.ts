import { Reservation } from './reservation.entity';

export interface ReservationRepository {
  save(reservation: Reservation): Promise<void>;
}
