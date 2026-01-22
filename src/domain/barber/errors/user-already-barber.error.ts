export class UserAlreadyBarber extends Error {
  constructor(userId: string) {
    super(`User with ID ${userId} is already a barber`);
  }
}
