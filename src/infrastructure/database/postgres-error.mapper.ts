export class PostgresErrorMapper {
  static isPostgresError(error: unknown): error is { code: string } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof error.code === 'string'
    );
  }

  static extractCode(error: unknown): string | null {
    if (!error || typeof error !== 'object') return null;

    // Direct pg error
    if (this.isPostgresError(error)) {
      return error.code;
    }

    // Drizzle wraps pg errors inside `cause`
    if ('cause' in error && error.cause && typeof error.cause === 'object') {
      if (
        'code' in error.cause &&
        typeof (error.cause as { code: unknown }).code === 'string'
      ) {
        return (error.cause as { code: string }).code;
      }
    }

    return null;
  }

  static isUniqueViolation(error: unknown): boolean {
    return this.extractCode(error) === '23P01';
  }

  static isForeignKeyViolation(error: unknown): boolean {
    return this.extractCode(error) === '23503';
  }

  static isNotNullViolation(error: unknown): boolean {
    return this.extractCode(error) === '23502';
  }

  static isCheckViolation(error: unknown): boolean {
    return this.extractCode(error) === '23514';
  }
}
