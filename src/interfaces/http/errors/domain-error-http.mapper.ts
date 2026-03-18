import { InvalidCredentialsError } from '@domain/auth/errors/invalid-credentials.error';
import { BarberNotFoundError } from '@domain/barber/errors/barber-not-found.error';
import { UserAlreadyBarberError } from '@domain/barber/errors/user-already-barber.error';
import { DependencyNotFoundError } from '@domain/errors/dependency-not-found.error';
import type { DomainError } from '@domain/errors/domain.error';
import { InvalidReservationTimeError } from '@domain/reservation/errors/invalid-reservation-time.error';
import { ReservationConflictError } from '@domain/reservation/errors/reservation-conflict.error';
import { InvalidUserEmailFormatError } from '@domain/user/errors/invalid-user-email-format.error';
import { InvalidUserPasswordHashError } from '@domain/user/errors/invalid-user-password-hash.error';
import { UserAlreadyExistsError } from '@domain/user/errors/user-already-exists.error';
import { UserNotFoundError } from '@domain/user/errors/user-not-found.error';
import { HttpStatus } from '@nestjs/common';

export const errorStatusMap: Record<string, HttpStatus> = {
  [BarberNotFoundError.name]: HttpStatus.NOT_FOUND,
  [DependencyNotFoundError.name]: HttpStatus.NOT_FOUND,
  [InvalidCredentialsError.name]: HttpStatus.UNAUTHORIZED,
  [InvalidReservationTimeError.name]: HttpStatus.UNPROCESSABLE_ENTITY,
  [InvalidUserEmailFormatError.name]: HttpStatus.BAD_REQUEST,
  [InvalidUserPasswordHashError.name]: HttpStatus.BAD_REQUEST,
  [ReservationConflictError.name]: HttpStatus.CONFLICT,
  [UserAlreadyBarberError.name]: HttpStatus.CONFLICT,
  [UserAlreadyExistsError.name]: HttpStatus.CONFLICT,
  [UserNotFoundError.name]: HttpStatus.NOT_FOUND,
};

export class DomainErrorHttpMapper {
  static toStatus(error: DomainError): HttpStatus {
    return errorStatusMap[error.constructor.name] ?? HttpStatus.BAD_REQUEST;
  }
}
