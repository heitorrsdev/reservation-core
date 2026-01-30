import { Barber } from './barber.entity';

export interface BarberRepository {
  save(barber: Barber): Promise<void>;
  findById(id: string): Promise<Barber | null>;
}
