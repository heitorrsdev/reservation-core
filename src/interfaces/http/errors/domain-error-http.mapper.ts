import { UserAlreadyBarberError } from '@domain/barber/errors/user-already-barber.error';
import type { DomainError } from '@domain/errors/domain.error';
import { UserAlreadyExistsError } from '@domain/user/errors/user-already-exists.error';
import { UserNotFoundError } from '@domain/user/errors/user-not-found.error';
import { HttpStatus } from '@nestjs/common';

const errorStatusMap: Record<string, HttpStatus> = {
  [UserAlreadyExistsError.name]: HttpStatus.CONFLICT,
  [UserAlreadyBarberError.name]: HttpStatus.CONFLICT,
  [UserNotFoundError.name]: HttpStatus.NOT_FOUND,
};

export class DomainErrorHttpMapper {
  static toStatus(error: DomainError): HttpStatus {
    return errorStatusMap[error.constructor.name] ?? HttpStatus.BAD_REQUEST;
  }
}
