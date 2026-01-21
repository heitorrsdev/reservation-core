export class InvalidUserPasswordHashError extends Error {
  constructor() {
    super('The provided password hash is invalid');
  }
}
