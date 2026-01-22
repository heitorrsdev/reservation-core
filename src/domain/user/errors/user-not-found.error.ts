export class UserNotFound extends Error {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`);
  }
}
