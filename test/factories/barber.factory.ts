import { testDb } from '@test/utils/infra/test-database';
import { randomUUID } from 'crypto';

import { barbers } from '@infrastructure/database/schema/barber';

import { createUserFactory } from './user.factory';

type CreateBarberInput = {
  id?: string;
  name?: string;
  bio?: string | null;
  active?: boolean;
};

export async function createBarberFactory(input: CreateBarberInput = {}) {
  const id = input.id ?? randomUUID();

  // Ensure user exists first
  await createUserFactory({ id });

  await testDb.insert(barbers).values({
    id,
    name: input.name ?? 'John Barber',
    bio: input.bio ?? null,
    active: input.active ?? true,
    createdAt: new Date(),
  });

  return { id };
}
