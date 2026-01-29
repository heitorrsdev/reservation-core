import { DomainError } from '@domain/errors/domain.error';

export class UserAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super(`User with email ${email} already exists.`);
  }
}
