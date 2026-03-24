import { DomainError } from '@domain/errors/domain.error';

export class ReservationNotFoundError extends DomainError {
  constructor(reservationId: string) {
    super(`Reservation with ID ${reservationId} not found`);
  }
}
