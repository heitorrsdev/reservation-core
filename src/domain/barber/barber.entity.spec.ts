import { Barber } from '@domain/barber/barber.entity';

describe('Barber Entity', () => {
  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const name = 'Sweeney Todd';
  const bio = 'A close shave.';

  describe('create()', () => {
    it('should create an active barber with a bio and current date', () => {
      const barber = Barber.create({ userId, name, bio });

      expect(barber.id).toBe(userId);
      expect(barber.name).toBe(name);
      expect(barber.bio).toBe(bio);
      expect(barber.active).toBe(true);
      expect(barber.createdAt).toBeInstanceOf(Date);
      // Ensure the timestamp is recent
      expect(Date.now() - barber.createdAt.getTime()).toBeLessThan(1000);
    });

    it('should create an active barber with a null bio if omitted', () => {
      const barber = Barber.create({ userId, name });

      expect(barber.id).toBe(userId);
      expect(barber.name).toBe(name);
      expect(barber.bio).toBeNull();
      expect(barber.active).toBe(true);
      expect(barber.createdAt).toBeInstanceOf(Date);
    });

    it('should create an active barber with a null bio if undefined is provided', () => {
      const barber = Barber.create({ userId, name, bio: undefined });

      expect(barber.id).toBe(userId);
      expect(barber.name).toBe(name);
      expect(barber.bio).toBeNull();
      expect(barber.active).toBe(true);
      expect(barber.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('reconstitute()', () => {
    it('should rebuild the entity exactly as provided', () => {
      const pastDate = new Date('2023-01-01T10:00:00Z');
      const props = {
        id: userId,
        name,
        bio: null,
        active: false,
        createdAt: pastDate,
      };

      const barber = Barber.reconstitute(props);

      expect(barber.id).toBe(props.id);
      expect(barber.name).toBe(props.name);
      expect(barber.bio).toBe(props.bio);
      expect(barber.active).toBe(props.active);
      expect(barber.createdAt).toBe(props.createdAt);
    });
  });

  describe('deactivate()', () => {
    it('should return a new Barber instance with active set to false', () => {
      const barber = Barber.create({ userId, name, bio });

      const deactivatedBarber = barber.deactivate();

      // Ensure it's a new instance
      expect(deactivatedBarber).not.toBe(barber);

      // Ensure properties are preserved
      expect(deactivatedBarber.id).toBe(barber.id);
      expect(deactivatedBarber.name).toBe(barber.name);
      expect(deactivatedBarber.bio).toBe(barber.bio);
      expect(deactivatedBarber.createdAt).toBe(barber.createdAt);

      // Ensure active is false
      expect(deactivatedBarber.active).toBe(false);

      // Ensure the original barber is still active (immutability)
      expect(barber.active).toBe(true);
    });
  });
});
