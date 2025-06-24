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

export class GetPlaceBookingsDto {
  @ApiProperty({
    description: 'Дата бронирования (YYYY-MM-DD)',
    required: false,
    example: '2023-12-31',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({
    description: 'Массив ID рабочих мест',
    type: [Number],
    example: [1, 2, 3],
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  placeIds: number[];
}
