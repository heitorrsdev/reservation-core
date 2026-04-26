import { DrizzleClient } from '@infrastructure/database/database.provider';
import { DATABASE } from '@infrastructure/database/database.token';
import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { sql } from 'drizzle-orm';

import { Public } from '../auth/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    @Inject(DATABASE)
    private readonly db: DrizzleClient,
  ) {}

  @Public()
  @Get('db')
  async getDatabaseHealth() {
    await this.db.execute(sql`SELECT 1`);
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get()
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
