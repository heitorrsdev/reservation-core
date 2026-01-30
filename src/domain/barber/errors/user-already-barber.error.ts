import { DomainError } from '@domain/errors/domain.error';

export class UserAlreadyBarber extends DomainError {
  constructor(userId: string) {
    super(`User with ID ${userId} is already a barber`);
  }
}
