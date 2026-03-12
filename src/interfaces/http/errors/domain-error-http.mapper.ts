import type { DomainError } from '@domain/errors/domain.error';
import { UserAlreadyExistsError } from '@domain/user/errors/user-already-exists.error';
import { HttpStatus } from '@nestjs/common';

const errorStatusMap = new Map<object, HttpStatus>([
  [UserAlreadyExistsError, HttpStatus.CONFLICT],
]);

export class DomainErrorHttpMapper {
  static toStatus(error: DomainError): HttpStatus {
    return errorStatusMap.get(error.constructor) ?? HttpStatus.BAD_REQUEST;
  }
}
