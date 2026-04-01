import { DomainError } from '@domain/errors/domain.error';

export class UnauthorizedReservationAccessError extends DomainError {
  constructor() {
    super('You are not authorized to access this reservation.');
  }
}
