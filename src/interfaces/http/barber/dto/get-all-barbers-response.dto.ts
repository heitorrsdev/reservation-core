export class BarberOverviewDto {
  id: string;
  name: string;
  bio: string | null;
}

export class GetAllBarbersResponseDto {
  data: BarberOverviewDto[];
}
