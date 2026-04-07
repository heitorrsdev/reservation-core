import type { OnApplicationShutdown } from '@nestjs/common';
import { Module } from '@nestjs/common';

import { closeDatabase, createDatabase } from './database.provider';
import { DATABASE } from './database.token';

@Module({
  providers: [
    {
      provide: DATABASE,
      useFactory: createDatabase,
    },
  ],
  exports: [DATABASE],
})
export class DatabaseModule implements OnApplicationShutdown {
  async onApplicationShutdown() {
    await closeDatabase();
  }
}
