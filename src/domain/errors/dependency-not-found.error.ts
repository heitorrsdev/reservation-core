import { DomainError } from './domain.error';

export class DependencyNotFoundError extends DomainError {
  constructor(entity: string, value?: string) {
    super(`${entity} with identifier ${value ?? 'unknown'} was not found.`);
  }
}
