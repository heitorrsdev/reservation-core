export interface CreateBarberCommand {
  userId: string;
  name: string;
  bio?: string | null;
}
