import { InvalidUserPasswordHashError } from '../errors/invalid-user-password-hash.error';

export class PasswordHash {
  private constructor(readonly value: string) {}

  static create(hash: string) {
    if (!hash || hash.length < 20) {
      throw new InvalidUserPasswordHashError();
    }
    return new PasswordHash(hash);
  }
}
