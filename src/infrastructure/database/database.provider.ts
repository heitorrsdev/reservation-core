import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { DatabaseUrlNotDefinedError } from './errors/database-url-not-defined.error';

export function createDatabase() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new DatabaseUrlNotDefinedError();
  }

  const pool = new Pool({ connectionString: url });
  return drizzle(pool);
}
