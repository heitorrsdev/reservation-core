import { DomainError } from '@domain/errors/domain.error';

export class CannotCancelPastReservationError extends DomainError {
  constructor() {
    super('Cannot cancel a reservation that is in the past.');
  }
}
