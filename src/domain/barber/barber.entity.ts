export class Barber {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly bio: string | null,
    readonly active: boolean,
    readonly createdAt: Date,
  ) {}

  static create(props: { userId: string; name: string; bio?: string | null }) {
    return new Barber(
      props.userId,
      props.name,
      props.bio ?? null,
      true,
      new Date(),
    );
  }

  static reconstitute(props: {
    id: string;
    name: string;
    bio: string | null;
    active: boolean;
    createdAt: Date;
  }) {
    return new Barber(
      props.id,
      props.name,
      props.bio,
      props.active,
      props.createdAt,
    );
  }

  deactivate() {
    return new Barber(this.id, this.name, this.bio, false, this.createdAt);
  }
}
