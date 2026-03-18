import { DomainError } from '@domain/errors/domain.error';
import { PostgresErrorMapper } from '@infrastructure/database/postgres-error.mapper';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

import { DomainErrorHttpMapper } from '../errors/domain-error-http.mapper';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      return response
        .status(exception.getStatus())
        .json(exception.getResponse());
    }

    if (exception instanceof DomainError) {
      const status = DomainErrorHttpMapper.toStatus(exception);

      this.logger.warn(exception.message);

      return response.status(status).json({
        statusCode: status,
        message: exception.message,
        error: HttpStatus[status],
      });
    }

    const pgCode = PostgresErrorMapper.extractCode(exception);

    if (pgCode) {
      this.logger.warn(`Postgres constraint violation: ${pgCode}`);

      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Database constraint violation',
        error: 'Bad Request',
      });
    }

    if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    } else {
      try {
        this.logger.error('Unhandled exception', JSON.stringify(exception));
      } catch {
        this.logger.error('Unhandled exception', String(exception));
      }
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: 500,
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
  }
}
