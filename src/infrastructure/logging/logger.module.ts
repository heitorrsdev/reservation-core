import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { IncomingMessage } from 'http';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction = config.get('NODE_ENV') === 'production';

        return {
          pinoHttp: {
            // Correlation ID: Ensure each request gets a unique ID
            genReqId: (req: IncomingMessage) => {
              return req.headers['x-correlation-id'] || randomUUID();
            },
            // PII Masking: auto mask sensitive fields
            redact: {
              paths: [
                'req.headers.authorization',
                'req.body.password',
                'req.body.passwordHash',
                'req.body.email',
                'req.body.refreshToken',
                'password',
                'passwordHash',
                'email',
                'refreshToken',
              ],
              censor: '***',
            },
            // Pretty Print ONLY when not in production
            transport: !isProduction
              ? {
                  target: 'pino-pretty',
                  options: {
                    singleLine: true,
                    colorize: true,
                  },
                }
              : undefined,
            // JSON format is default in pino for production
          },
        };
      },
    }),
  ],
  exports: [LoggerModule],
})
export class AppLoggerModule {}
