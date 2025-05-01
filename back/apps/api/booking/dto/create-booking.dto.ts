import { IsDateString, IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateBookingDto {
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @IsInt()
  @IsNotEmpty()
  placeId: number;

  @IsInt()
  @IsNotEmpty()
  userId: number;
}
