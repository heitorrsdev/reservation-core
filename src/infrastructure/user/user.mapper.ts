import { User } from '@domain/user/user.entity';

export class UserMapper {
  static toDomain(raw: {
    id: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
  }): User {
    return User.create({
      id: raw.id,
      email: raw.email,
      passwordHash: raw.passwordHash,
      createdAt: raw.createdAt,
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
