export interface TokenGenerator {
  generate(payload: { sub: string; email: string }): Promise<string>;
}
