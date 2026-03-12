import type { Database } from '@infrastructure/database/database.provider';
import { barbers } from '@infrastructure/database/schema/barber';
import { randomUUID } from 'crypto';

type BarberInsert = typeof barbers.$inferInsert;

export function buildBarber(input: Partial<BarberInsert> = {}) {
  const id = input.id ?? randomUUID();
  const name = input.name ?? 'John Doe';
  const bio = input.bio ?? null;
  const active = input.active ?? true;
  const createdAt = input.createdAt ?? new Date();

  return {
    id,
    name,
    bio,
    active,
    createdAt,
  };
}

export async function persistBarber(
  db: Database,
  input?: Partial<BarberInsert>,
) {
  const data = buildBarber(input);

  await db.insert(barbers).values(data);
  return data;
}
