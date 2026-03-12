import type { Database } from '@infrastructure/database/database.provider';
import { users } from '@infrastructure/database/schema/user';
import { randomUUID } from 'crypto';

type UserInsert = typeof users.$inferInsert;

export function buildUser(input: Partial<UserInsert> = {}) {
  const id = input.id ?? randomUUID();
  const email = input.email ?? `user-${id}@example.com`;
  const passwordHash = input.passwordHash ?? 'hashed-password';
  const createdAt = input.createdAt ?? new Date();

  return {
    id,
    email,
    passwordHash,
    createdAt,
  };
}

export async function persistUser(db: Database, input?: Partial<UserInsert>) {
  const data = buildUser(input);
  await db.insert(users).values(data);
  return data;
}
