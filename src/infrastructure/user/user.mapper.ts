import { User } from '@domain/user/user.entity';
import { users } from '@infrastructure/database/schema/user';

type UserSelect = typeof users.$inferSelect;
type UserInsert = typeof users.$inferInsert;

export class UserMapper {
  static toDomain(row: UserSelect): User {
    return User.create({
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      createdAt: row.createdAt,
    });
  }

  static toPersistence(user: User): UserInsert {
    return {
      id: user.id,
      email: user.email.value,
      passwordHash: user.passwordHash.value,
      createdAt: user.createdAt,
    };
  }
}
