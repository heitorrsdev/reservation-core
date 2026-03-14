import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateBarberDto {
  @IsUUID('4', { message: 'userId must be a valid UUID' })
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  bio?: string | null;
}
