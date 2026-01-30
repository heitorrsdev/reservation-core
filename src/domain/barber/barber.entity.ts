export class Barber {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly bio: string | null,
    readonly active: boolean,
    readonly createdAt: Date,
  ) {}

  static create(props: {
    userId: string;
    name: string;
    bio?: string | null;
    createdAt?: Date;
  }) {
    return new Barber(
      props.userId,
      props.name,
      props.bio ?? null,
      true,
      props.createdAt || new Date(),
    );
  }

  deactivate() {
    return new Barber(this.id, this.name, this.bio, false, this.createdAt);
  }
}
