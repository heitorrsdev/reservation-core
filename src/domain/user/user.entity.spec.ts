import { InvalidUserEmailFormatError } from './errors/invalid-user-email-format.error';
import { InvalidUserPasswordHashError } from './errors/invalid-user-password-hash.error';
import { User } from './user.entity';

describe('User', () => {
  const validEmail = 'test@example.com';
  const validPasswordHash = '$argon2id$v=19$m=65536,t=3,p=4$somehash';

  describe('create', () => {
    it('should create a user with a generated id and current date when id is not provided', () => {
      const before = new Date();
      const user = User.create({
        email: validEmail,
        passwordHash: validPasswordHash,
      });
      const after = new Date();

      expect(user).toBeInstanceOf(User);
      expect(typeof user.id).toBe('string');
      expect(user.id.length).toBeGreaterThan(0);
      expect(user.email.value).toBe(validEmail);
      expect(user.passwordHash.value).toBe(validPasswordHash);
      expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should create a user with the provided id', () => {
      const id = 'custom-id';
      const user = User.create({
        id,
        email: validEmail,
        passwordHash: validPasswordHash,
      });

      expect(user.id).toBe(id);
    });

    it('should throw an error for an invalid email', () => {
      expect(() => {
        User.create({
          email: 'invalid-email',
          passwordHash: validPasswordHash,
        });
      }).toThrow(InvalidUserEmailFormatError);
    });

    it('should throw an error for an invalid password hash', () => {
      expect(() => {
        User.create({
          email: validEmail,
          passwordHash: 'invalid-hash',
        });
      }).toThrow(InvalidUserPasswordHashError);
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute a user with exact provided properties', () => {
      const id = 'reconstituted-id';
      const email = 'reconstitute@example.com';
      const passwordHash = '$argon2i$v=19$m=16,t=2,p=1$MTAwMDAwMDA$wB/j0A';
      const createdAt = new Date('2023-01-01T00:00:00Z');

      const user = User.reconstitute({
        id,
        email,
        passwordHash,
        createdAt,
      });

      expect(user).toBeInstanceOf(User);
      expect(user.id).toBe(id);
      expect(user.email.value).toBe(email);
      expect(user.passwordHash.value).toBe(passwordHash);
      expect(user.createdAt).toBe(createdAt);
    });
  });
});
