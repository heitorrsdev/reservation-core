import { TEST_TIME } from '@test/utils/time';
import { randomUUID } from 'crypto';

import { Database } from '@infrastructure/database/database.provider';
import { users } from '@infrastructure/database/schema/user';

type persistUserInput = {
  id?: string;
  email?: string;
  passwordHash?: string;
  createdAt?: Date;
};

export function buildUser(input: persistUserInput = {}) {
  const id = input.id ?? randomUUID();
  return {
    id,
    email: input.email ?? `user-${id}@example.com`,
    passwordHash: input.passwordHash ?? 'hash',
    createdAt: input.createdAt ?? TEST_TIME,
  };
}

export async function persistUser(db: Database, input?: persistUserInput) {
  const data = buildUser(input);
  await db.insert(users).values(data);
  return data;
}
