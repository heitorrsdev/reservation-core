export class GetAllBarbersResponseDto {
  data: Array<{
    id: string;
    name: string;
    bio: string | null;
  }>;
}
