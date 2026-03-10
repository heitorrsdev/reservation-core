import { ApplicationModule } from '@application/application.module';
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { UserController } from './user/user.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [UserController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class HttpModule {}
