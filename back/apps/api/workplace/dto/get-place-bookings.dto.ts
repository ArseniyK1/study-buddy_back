import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsDateString } from 'class-validator';

export class GetPlaceBookingsDto {
  @ApiProperty({
    description: 'Дата для отображения бронирований',
    example: '2024-06-01',
  })
  @IsString()
  @IsDateString()
  date: string;
}
