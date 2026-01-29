export abstract class ApplicationError extends Error {
  protected constructor(message: string) {
    super(message);
  }
}
