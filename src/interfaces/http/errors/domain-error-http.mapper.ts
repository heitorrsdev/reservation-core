import { InvalidCredentialsError } from '@domain/auth/errors/invalid-credentials.error';
import { InvalidRefreshTokenError } from '@domain/auth/errors/invalid-refresh-token.error';
import { RefreshTokenReuseError } from '@domain/auth/errors/refresh-token-reuse.error';
import { BarberInactiveError } from '@domain/barber/errors/barber-inactive.error';
import { BarberNotFoundError } from '@domain/barber/errors/barber-not-found.error';
import { UserAlreadyBarberError } from '@domain/barber/errors/user-already-barber.error';
import { DependencyNotFoundError } from '@domain/errors/dependency-not-found.error';
import type { DomainError } from '@domain/errors/domain.error';
import { CannotCancelPastReservationError } from '@domain/reservation/errors/cannot-cancel-past-reservation.error';
import { CannotRescheduleCancelledReservationError } from '@domain/reservation/errors/cannot-reschedule-cancelled-reservation.error';
import { CannotReschedulePastReservationError } from '@domain/reservation/errors/cannot-reschedule-past-reservation.error';
import { ClientLateCancellationError } from '@domain/reservation/errors/client-late-cancellation.error';
import { InvalidReservationTimeError } from '@domain/reservation/errors/invalid-reservation-time.error';
import { ReservationAlreadyCancelledError } from '@domain/reservation/errors/reservation-already-cancelled.error';
import { ReservationConflictError } from '@domain/reservation/errors/reservation-conflict.error';
import { ReservationNotFoundError } from '@domain/reservation/errors/reservation-not-found.error';
import { UnauthorizedReservationAccessError } from '@domain/reservation/errors/unauthorized-reservation-access.error';
import { InvalidUserEmailFormatError } from '@domain/user/errors/invalid-user-email-format.error';
import { InvalidUserPasswordHashError } from '@domain/user/errors/invalid-user-password-hash.error';
import { UserAlreadyExistsError } from '@domain/user/errors/user-already-exists.error';
import { UserNotFoundError } from '@domain/user/errors/user-not-found.error';
import { HttpStatus } from '@nestjs/common';

export const errorStatusMap: Record<string, HttpStatus> = {
  [BarberInactiveError.name]: HttpStatus.GONE,
  [BarberNotFoundError.name]: HttpStatus.NOT_FOUND,
  [CannotCancelPastReservationError.name]: HttpStatus.UNPROCESSABLE_ENTITY,
  [CannotRescheduleCancelledReservationError.name]: HttpStatus.CONFLICT,
  [CannotReschedulePastReservationError.name]: HttpStatus.UNPROCESSABLE_ENTITY,
  [ClientLateCancellationError.name]: HttpStatus.UNPROCESSABLE_ENTITY,
  [DependencyNotFoundError.name]: HttpStatus.NOT_FOUND,
  [InvalidCredentialsError.name]: HttpStatus.UNAUTHORIZED,
  [InvalidRefreshTokenError.name]: HttpStatus.UNAUTHORIZED,
  [InvalidReservationTimeError.name]: HttpStatus.UNPROCESSABLE_ENTITY,
  [InvalidUserEmailFormatError.name]: HttpStatus.BAD_REQUEST,
  [InvalidUserPasswordHashError.name]: HttpStatus.BAD_REQUEST,
  [RefreshTokenReuseError.name]: HttpStatus.UNAUTHORIZED,
  [ReservationAlreadyCancelledError.name]: HttpStatus.CONFLICT,
  [ReservationConflictError.name]: HttpStatus.CONFLICT,
  [ReservationNotFoundError.name]: HttpStatus.NOT_FOUND,
  [UnauthorizedReservationAccessError.name]: HttpStatus.FORBIDDEN,
  [UserAlreadyBarberError.name]: HttpStatus.CONFLICT,
  [UserAlreadyExistsError.name]: HttpStatus.CONFLICT,
  [UserNotFoundError.name]: HttpStatus.NOT_FOUND,
};

export class DomainErrorHttpMapper {
  static toStatus(error: DomainError): HttpStatus {
    return errorStatusMap[error.constructor.name] ?? HttpStatus.BAD_REQUEST;
  }
}
