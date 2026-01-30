import { DomainError } from '@domain/errors/domain.error';

export class UserNotFoundError extends DomainError {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`);
  }
}
