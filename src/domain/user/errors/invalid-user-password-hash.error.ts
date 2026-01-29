import { DomainError } from '@domain/errors/domain.error';

export class InvalidUserPasswordHashError extends DomainError {
  constructor() {
    super('The provided password hash is invalid');
  }
}
