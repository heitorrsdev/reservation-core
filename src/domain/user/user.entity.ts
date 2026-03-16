import { randomUUID } from 'crypto';

import { Email } from './value-objects/email.vo';
import { PasswordHash } from './value-objects/password-hash.vo';

export class User {
  private constructor(
    readonly id: string,
    readonly email: Email,
    readonly passwordHash: PasswordHash,
    readonly createdAt: Date,
  ) {}

  static create(props: { id?: string; email: string; passwordHash: string }) {
    return new User(
      props.id || randomUUID(),
      Email.create(props.email),
      PasswordHash.create(props.passwordHash),
      new Date(),
    );
  }

  static reconstitute(props: {
    id: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
  }) {
    return new User(
      props.id,
      Email.create(props.email),
      PasswordHash.create(props.passwordHash),
      props.createdAt,
    );
  }
}
