export class InvalidUserEmailFormatError extends Error {
  constructor() {
    super('The provided email format is invalid');
  }
}
