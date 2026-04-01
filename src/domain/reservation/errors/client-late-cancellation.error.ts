import { DomainError } from '@domain/errors/domain.error';

export class ClientLateCancellationError extends DomainError {
  constructor() {
    super(
      'Clients cannot cancel reservations with less than 1 hour of notice.',
    );
  }
}
