export abstract class InfrastructureError extends Error {
  protected constructor(message: string) {
    super(message);
  }
}
