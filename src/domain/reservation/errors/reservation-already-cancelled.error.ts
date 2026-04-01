import { DomainError } from '@domain/errors/domain.error';

export class ReservationAlreadyCancelledError extends DomainError {
  constructor() {
    super('Reservation is already cancelled.');
  }
}
