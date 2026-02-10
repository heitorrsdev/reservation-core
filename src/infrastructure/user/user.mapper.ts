import { User } from '@domain/user/user.entity';

type userRow = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
};
export class UserMapper {
  static toDomain(row: userRow): User {
    return User.create({
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      createdAt: row.createdAt,
    });
  }

  static toPersistence(user: User): userRow {
    return {
      id: user.id,
      email: user.email.value,
      passwordHash: user.passwordHash.value,
      createdAt: user.createdAt,
    };
  }
}
