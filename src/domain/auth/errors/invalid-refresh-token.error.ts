import { DomainError } from '@domain/errors/domain.error';

export class InvalidRefreshTokenError extends DomainError {
  constructor() {
    super('Invalid or expired refresh token');
  }
}
