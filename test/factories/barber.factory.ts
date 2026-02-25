import { TEST_TIME } from '@test/utils/time';
import { randomUUID } from 'crypto';

import { Barber } from '@domain/barber/barber.entity';

import { Database } from '@infrastructure/database/database.provider';
import { barbers } from '@infrastructure/database/schema/barber';

export function buildBarber(input: Partial<Barber> = {}) {
  const id = input.id ?? randomUUID();

  return {
    id,
    name: input.name ?? 'John Barber',
    bio: input.bio ?? null,
    active: input.active ?? true,
    createdAt: input.createdAt ?? TEST_TIME,
  };
}

export async function persistBarber(db: Database, input?: Partial<Barber>) {
  const data = buildBarber(input);

  await db.insert(barbers).values(data);
  return data;
}
