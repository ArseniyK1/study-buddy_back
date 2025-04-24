import { IsDate, IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({
    description: 'Start time of the booking',
    example: '2023-05-01T10:00:00Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  startTime: Date;

  @ApiProperty({
    description: 'End time of the booking',
    example: '2023-05-01T12:00:00Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  endTime: Date;

  @ApiProperty({ description: 'ID of the place to book' })
  @IsInt()
  @IsNotEmpty()
  placeId: number;

  @ApiProperty({ description: 'ID of the user making the booking' })
  @IsInt()
  @IsNotEmpty()
  userId: number;
}
