import { sql } from 'drizzle-orm';

import { testDb } from './test-database';

type PgTableRow = { tablename: string };

export async function truncateTestDatabase() {
  const tables = (await testDb.execute(
    sql.raw(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename NOT LIKE 'drizzle_%'
        AND tablename NOT LIKE 'migrations%';
    `),
  )) as { rows: PgTableRow[] };

  const tableNames = tables.rows.map((r) => `"public"."${r.tablename}"`);

  if (!tableNames.length) return;

  await testDb.execute(
    sql.raw(`
      TRUNCATE TABLE ${tableNames.join(', ')}
      RESTART IDENTITY CASCADE;
    `),
  );
}
