import { Argon2PasswordHasher } from '@infrastructure/user/argon2-password-hasher';
import * as argon2 from 'argon2';

jest.mock('argon2');

describe('Argon2PasswordHasher', () => {
  let hasher: Argon2PasswordHasher;

  beforeEach(() => {
    hasher = new Argon2PasswordHasher();
    jest.clearAllMocks();
  });

  describe('hash', () => {
    it('should hash a password using argon2', async () => {
      const plain = 'my-password';
      const expectedHash = '$argon2id$v=19$m=4096,t=3,p=1$c29tZXNhbHQ$somehash';

      (argon2.hash as jest.Mock).mockResolvedValue(expectedHash);

      const result = await hasher.hash(plain);

      expect(result).toBe(expectedHash);
      expect(argon2.hash).toHaveBeenCalledWith(plain, {
        type: argon2.argon2id,
      });
      expect(argon2.hash).toHaveBeenCalledTimes(1);
    });

    it('should throw if argon2 throws', async () => {
      const plain = 'my-password';
      const error = new Error('Argon2 hash failed');

      (argon2.hash as jest.Mock).mockRejectedValue(error);

      await expect(hasher.hash(plain)).rejects.toThrow(error);
    });
  });

  describe('compare', () => {
    it('should return true if password matches hash', async () => {
      const plain = 'my-password';
      const hash = '$argon2id$v=19$m=4096,t=3,p=1$c29tZXNhbHQ$somehash';

      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const result = await hasher.compare(plain, hash);

      expect(result).toBe(true);
      expect(argon2.verify).toHaveBeenCalledWith(hash, plain);
      expect(argon2.verify).toHaveBeenCalledTimes(1);
    });

    it('should return false if password does not match hash', async () => {
      const plain = 'wrong-password';
      const hash = '$argon2id$v=19$m=4096,t=3,p=1$c29tZXNhbHQ$somehash';

      (argon2.verify as jest.Mock).mockResolvedValue(false);

      const result = await hasher.compare(plain, hash);

      expect(result).toBe(false);
      expect(argon2.verify).toHaveBeenCalledWith(hash, plain);
      expect(argon2.verify).toHaveBeenCalledTimes(1);
    });

    it('should throw if argon2 throws', async () => {
      const plain = 'my-password';
      const hash = '$argon2id$v=19$m=4096,t=3,p=1$c29tZXNhbHQ$somehash';
      const error = new Error('Argon2 verify failed');

      (argon2.verify as jest.Mock).mockRejectedValue(error);

      await expect(hasher.compare(plain, hash)).rejects.toThrow(error);
    });
  });
});
