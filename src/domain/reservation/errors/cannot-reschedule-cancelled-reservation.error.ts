import { DomainError } from '@domain/errors/domain.error';

export class CannotRescheduleCancelledReservationError extends DomainError {
  constructor() {
    super('Cannot reschedule a cancelled reservation.');
  }
}
