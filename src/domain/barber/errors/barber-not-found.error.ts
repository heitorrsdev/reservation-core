import { DomainError } from '@domain/errors/domain.error';

export class BarberNotFoundError extends DomainError {
  constructor(barberId: string) {
    super(`Barber with ID ${barberId} not found`);
  }
}
