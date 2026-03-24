import { DomainError } from '@domain/errors/domain.error';

export class BarberInactiveError extends DomainError {
  constructor(barberId: string) {
    super(`Barber with ID ${barberId} is inactive`);
  }
}
