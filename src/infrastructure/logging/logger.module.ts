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
        const isTest = config.get('NODE_ENV') === 'test';

        return {
          pinoHttp: {
            genReqId: (req: IncomingMessage) => {
              return req.headers['x-correlation-id'] || randomUUID();
            },
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
            transport:
              !isProduction && !isTest
                ? {
                    target: 'pino-pretty',
                    options: {
                      singleLine: true,
                      colorize: true,
                    },
                  }
                : undefined,
          },
        };
      },
    }),
  ],
  exports: [LoggerModule],
})
export class AppLoggerModule {}
