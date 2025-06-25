// get-place-bookings.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsDateString,
  IsOptional,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
} from 'class-validator';

export class GetPlaceBookingsOldDto {
  @ApiProperty({
    description: 'Дата бронирования (YYYY-MM-DD)',
    required: false,
    example: '2023-12-31',
  })
  @IsOptional()
  @IsDateString()
  date?: string;
}
