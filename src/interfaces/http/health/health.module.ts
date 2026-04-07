import { DatabaseModule } from '@infrastructure/database/database.module';
import { Module } from '@nestjs/common';

import { HealthController } from './health.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [HealthController],
})
export class HealthModule {}
