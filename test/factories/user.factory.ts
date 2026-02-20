import { testDb } from '@test/utils/infra/test-database';
import { randomUUID } from 'crypto';

import { users } from '@infrastructure/database/schema/user';

type CreateUserInput = {
  id?: string;
  email?: string;
  passwordHash?: string;
  createdAt?: Date;
};

export async function createUserFactory(input: CreateUserInput = {}) {
  const id = input.id ?? randomUUID();

  await testDb.insert(users).values({
    id,
    email: input.email ?? `${id}@test.com`,
    passwordHash: input.passwordHash ?? 'hash',
    createdAt: input.createdAt ?? new Date(),
  });

  return { id };
}
