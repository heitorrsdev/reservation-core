import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateReservationDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsUUID()
  barberId: string;

  @IsNotEmpty()
  @IsDateString()
  startTime: string;

  @IsNotEmpty()
  @IsDateString()
  endTime: string;
}
