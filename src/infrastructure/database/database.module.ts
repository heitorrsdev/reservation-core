import { Module } from '@nestjs/common';

import { createDatabase } from './database.provider';
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
export class DatabaseModule {}
