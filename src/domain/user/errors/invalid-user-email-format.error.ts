import { DomainError } from '@domain/errors/domain.error';

export class InvalidUserEmailFormatError extends DomainError {
  constructor() {
    super('The provided email format is invalid');
  }
}
