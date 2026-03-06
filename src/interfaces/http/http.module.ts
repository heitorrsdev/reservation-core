import { ApplicationModule } from '@application/application.module';
import { Module } from '@nestjs/common';

import { UserController } from './user/user.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [UserController],
})
export class HttpModule {}
