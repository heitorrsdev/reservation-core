import { IsDateString, IsNotEmpty } from 'class-validator';

export class RescheduleReservationDto {
  @IsNotEmpty()
  @IsDateString()
  newStartTime: string;

  @IsNotEmpty()
  @IsDateString()
  newEndTime: string;
}
