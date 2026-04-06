export class PostgresErrorMapper {
  static isPostgresError(
    error: unknown,
  ): error is { code: string; detail?: string } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof (error as Record<string, unknown>).code === 'string'
    );
  }

  static extractCode(error: unknown): string | null {
    if (!error || typeof error !== 'object') return null;

    if (this.isPostgresError(error)) {
      return error.code;
    }

    if ('cause' in error) {
      const cause = (error as { cause: unknown }).cause;
      if (this.isPostgresError(cause)) {
        return cause.code;
      }
    }

    return null;
  }

  static extractDetail(error: unknown): string | null {
    if (this.isPostgresError(error) && error.detail) {
      return error.detail;
    }

    if (typeof error === 'object' && error !== null && 'cause' in error) {
      const cause = (error as { cause: unknown }).cause;
      if (this.isPostgresError(cause) && cause.detail) {
        return cause.detail;
      }
    }

    return null;
  }

  static getForeignKeyDetails(
    error: unknown,
  ): { column: string; value: string } | null {
    const detail = this.extractDetail(error);
    if (!detail) return null;

    const match = detail.match(/Key \(([^)]+)\)=\(([^)]+)\)/);
    if (!match) return null;

    return {
      column: match[1],
      value: match[2],
    };
  }

  static isNotNullViolation(error: unknown): boolean {
    return this.extractCode(error) === '23502';
  }

  static isForeignKeyViolation(error: unknown): boolean {
    return this.extractCode(error) === '23503';
  }

  static isUniqueViolation(error: unknown): boolean {
    return this.extractCode(error) === '23505';
  }

  static isCheckViolation(error: unknown): boolean {
    return this.extractCode(error) === '23514';
  }

  static isExclusionViolation(error: unknown): boolean {
    return this.extractCode(error) === '23P01';
  }

  static isDeadlock(error: unknown): boolean {
    return this.extractCode(error) === '40P01';
  }

  static isSerializationFailure(error: unknown): boolean {
    return this.extractCode(error) === '40001';
  }

  static isConcurrencyError(error: unknown): boolean {
    return (
      this.isDeadlock(error) ||
      this.isSerializationFailure(error) ||
      this.isUniqueViolation(error) ||
      this.isExclusionViolation(error)
    );
  }
}
