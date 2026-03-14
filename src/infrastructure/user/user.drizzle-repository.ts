import { UserAlreadyExistsError } from '@domain/user/errors/user-already-exists.error';
import { User } from '@domain/user/user.entity';
import { UserRepository } from '@domain/user/user.repository';
import { DrizzleClient } from '@infrastructure/database/database.provider';
import { DATABASE } from '@infrastructure/database/database.token';
import { PostgresErrorMapper } from '@infrastructure/database/postgres-error.mapper';
import { users } from '@infrastructure/database/schema/user';
import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { UserMapper } from './user.mapper';

@Injectable()
export class UserDrizzleRepository implements UserRepository {
  constructor(@Inject(DATABASE) private readonly db: DrizzleClient) {}

  async save(user: User): Promise<void> {
    try {
      await this.db.insert(users).values({
        id: user.id,
        email: user.email.value,
        passwordHash: user.passwordHash.value,
        createdAt: user.createdAt,
      });
    } catch (error: unknown) {
      if (PostgresErrorMapper.isUniqueViolation(error)) {
        throw new UserAlreadyExistsError(user.email.value);
      }

      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (result.length === 0) return null;

    return UserMapper.toDomain({
      id: result[0].id,
      email: result[0].email,
      passwordHash: result[0].passwordHash,
      createdAt: result[0].createdAt,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!result.length) return null;

    return UserMapper.toDomain(result[0]);
  }
}
