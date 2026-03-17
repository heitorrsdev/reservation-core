export class PostgresErrorMapper {
  static isPostgresError(
    error: unknown,
  ): error is { code: string; detail?: string } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof error.code === 'string'
    );
  }

  static extractCode(error: unknown): string | null {
    if (!error || typeof error !== 'object') return null;

    if (this.isPostgresError(error)) {
      return error.code;
    }

    // Drizzle wraps pg errors inside `cause`
    if ('cause' in error && error.cause && typeof error.cause === 'object') {
      const cause = error.cause as { code?: unknown };
      if (typeof cause.code === 'string') {
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
      const cause = error.cause as { detail?: unknown };
      if (typeof cause.detail === 'string') {
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

    const match = detail.match(/Key \((.+)\)=\((.+)\) is not present/);
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
}
