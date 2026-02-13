import { InfrastructureError } from '../../errors/infrastructure';

export class DatabaseUrlNotDefinedError extends InfrastructureError {
  constructor() {
    super('DATABASE_URL is not defined');
  }
}
