export class Barrier {
  private count: number = 0;
  private resolve!: () => void;
  private promise: Promise<void>;

  constructor(private readonly total: number) {
    this.promise = new Promise((res) => (this.resolve = res));
  }

  async wait(): Promise<void> {
    this.count++;
    if (this.count === this.total) {
      this.resolve();
    }
    return this.promise;
  }
}
