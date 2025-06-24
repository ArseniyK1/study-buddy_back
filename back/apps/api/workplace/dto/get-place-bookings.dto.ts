import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsDateString, IsOptional } from 'class-validator';

export class GetPlaceBookingsDto {
  @ApiProperty({
    description: 'Дата для отображения бронирований',
    example: '2024-06-01',
  })
  @IsString()
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiProperty({
    description: 'Список ID рабочих мест',
    example: [1, 2, 3],
  })
  @IsInt({ each: true })
  @IsOptional()
  placeIds?: number[];
}
