export class GetBarberByIdResponseDto {
  id: string;
  name: string;
  bio: string | null;
  active: boolean;
  createdAt: Date;
}
