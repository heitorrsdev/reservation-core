import { UserAlreadyBarberError } from '@domain/barber/errors/user-already-barber.error';
import { InvalidReservationTimeError } from '@domain/reservation/errors/invalid-reservation-time.error';
import { ReservationConflictError } from '@domain/reservation/errors/reservation-conflict.error';
import { InvalidUserEmailFormatError } from '@domain/user/errors/invalid-user-email-format.error';
import { InvalidUserPasswordHashError } from '@domain/user/errors/invalid-user-password-hash.error';
import { UserAlreadyExistsError } from '@domain/user/errors/user-already-exists.error';
import { UserNotFoundError } from '@domain/user/errors/user-not-found.error';
import { HttpStatus } from '@nestjs/common';

import { DomainErrorHttpMapper } from '../../src/interfaces/http/errors/domain-error-http.mapper';

describe('DomainErrorHttpMapper', () => {
  it.each([
    [new UserAlreadyExistsError(), HttpStatus.CONFLICT],
    [new UserAlreadyBarberError(), HttpStatus.CONFLICT],
    [new UserNotFoundError(), HttpStatus.NOT_FOUND],
    [new ReservationConflictError(), HttpStatus.CONFLICT],
    [new InvalidReservationTimeError(), HttpStatus.BAD_REQUEST],
    [new InvalidUserEmailFormatError(), HttpStatus.BAD_REQUEST],
    [new InvalidUserPasswordHashError(), HttpStatus.BAD_REQUEST],
  ])('should map %s to %s', (error, expectedStatus) => {
    const status = DomainErrorHttpMapper.toStatus(error as any);
    expect(status).toBe(expectedStatus);
  });

  it('should return BAD_REQUEST for unknown domain errors', () => {
    class UnknownError extends Error {
      constructor() {
        super('Unknown error');
      }
    }
    const status = DomainErrorHttpMapper.toStatus(new UnknownError() as any);
    expect(status).toBe(HttpStatus.BAD_REQUEST);
  });
});
