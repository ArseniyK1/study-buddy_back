import { IsDate, IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({
    description: 'Время начала бронирования',
    example: '2023-05-01T10:00:00Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  startTime: Date;

  @ApiProperty({
    description: 'Время окончания бронирования',
    example: '2023-05-01T12:00:00Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  endTime: Date;

  @ApiProperty({ description: 'ID рабочего места' })
  @IsInt()
  @IsNotEmpty()
  placeId: number;
}
