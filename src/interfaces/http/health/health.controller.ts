import { DrizzleClient } from '@infrastructure/database/database.provider';
import { DATABASE } from '@infrastructure/database/database.token';
import { Controller, Get, Inject } from '@nestjs/common';
import { sql } from 'drizzle-orm';

import { Public } from '../auth/public.decorator';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(DATABASE)
    private readonly db: DrizzleClient,
  ) {}

  @Public()
  @Get()
  async getHealth() {
    await this.db.execute(sql`SELECT 1`);
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
