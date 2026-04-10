import { DomainError } from '@domain/errors/domain.error';

export class CannotReschedulePastReservationError extends DomainError {
  constructor() {
    super('Cannot reschedule a reservation that is in the past.');
  }
}
