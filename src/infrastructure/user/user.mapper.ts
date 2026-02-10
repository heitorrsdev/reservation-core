import { User } from '@domain/user/user.entity';

export class UserMapper {
  static toDomain(row: {
    id: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
  }): User {
    return User.create({
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      createdAt: row.createdAt,
    });
  }

  static toPersistence(user: User): {
    id: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
  } {
    return {
      id: user.id,
      email: user.email.value,
      passwordHash: user.passwordHash.value,
      createdAt: user.createdAt,
    };
  }
}
