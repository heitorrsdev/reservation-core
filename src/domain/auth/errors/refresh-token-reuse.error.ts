import { DomainError } from '@domain/errors/domain.error';

export class RefreshTokenReuseError extends DomainError {
  constructor() {
    super('Refresh token reuse detected');
  }
}
