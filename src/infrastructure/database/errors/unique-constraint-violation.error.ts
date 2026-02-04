import { InfrastructureError } from '@infrastructure/errors/infrastructure';

export class UniqueConstraintViolationError extends InfrastructureError {
  constructor(readonly constraint: string) {
    super(`Unique constraint violated: ${constraint}`);
  }
}
