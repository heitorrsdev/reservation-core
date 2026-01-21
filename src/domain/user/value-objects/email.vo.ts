import { InvalidUserEmailFormatError } from '../errors/invalid-user-email-format.error';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export class Email {
  private constructor(readonly value: string) {}

  static create(value: string): Email {
    if (!EMAIL_REGEX.test(value)) {
      throw new InvalidUserEmailFormatError();
    }
    return new Email(value.toLowerCase());
  }
}
