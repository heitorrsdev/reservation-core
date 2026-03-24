import { DomainError } from '@domain/errors/domain.error';
import {
  DomainErrorHttpMapper,
  errorStatusMap,
} from '@http/errors/domain-error-http.mapper';
import { HttpStatus } from '@nestjs/common';

describe('DomainErrorHttpMapper', () => {
  it('should return the correct status for each mapped domain error', () => {
    for (const errorName in errorStatusMap) {
      const mockError = {
        constructor: { name: errorName },
      } as DomainError;

      const status = DomainErrorHttpMapper.toStatus(mockError);

      expect(status).toBe(errorStatusMap[errorName]);
    }
  });

  it('should return BAD_REQUEST for unknown domain errors', () => {
    class UnknownError extends DomainError {
      constructor() {
        super('Unknown error');
      }
    }
    const status = DomainErrorHttpMapper.toStatus(new UnknownError());
    expect(status).toBe(HttpStatus.BAD_REQUEST);
  });
});
