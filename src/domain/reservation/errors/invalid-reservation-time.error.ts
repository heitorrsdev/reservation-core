import { DomainError } from '@domain/errors/domain.error';

export class InvalidReservationTimeError extends DomainError {
  constructor() {
    super('End time must be after start time');
  }
}
