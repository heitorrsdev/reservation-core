import { DomainError } from '@domain/errors/domain.error';

export class ReservationConflictError extends DomainError {
  constructor() {
    super('The barber already has a reservation in this time range');
  }
}
