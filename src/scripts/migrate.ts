import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { Client } from 'pg';

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  // bootstrap
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  type SchemaMigrationRow = {
    version: string;
  };

  const result = await client.query<SchemaMigrationRow>(
    'SELECT version FROM schema_migrations',
  );

  const applied = new Set(result.rows.map((r) => r.version));

  const migrationsDir = join(process.cwd(), 'migrations');

  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (applied.has(file)) continue;

    console.log(`→ applying ${file}`);

    const sql = readFileSync(join(migrationsDir, file), 'utf8');

    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query(
        'INSERT INTO schema_migrations (version) VALUES ($1)',
        [file],
      );
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    }
  }

  await client.end();
}

main().catch((err) => {
  console.error('❌ Migration failed');
  console.error(err);
  process.exit(1);
});
