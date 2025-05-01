import { IsOptional, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
export class GetMyBookingsDto {
  @ApiProperty({
    description: 'Offset',
    required: true,
    type: Number,
  })
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  offset: number;

  @ApiProperty({
    description: 'Limit',
    required: true,
    type: Number,
  })
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  limit: number;

  @ApiProperty({
    description: 'Status',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  status: string;

  @ApiProperty({
    description: 'Start Date',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  startDate: string;

  @ApiProperty({
    description: 'End Date',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  endDate: string;

  @ApiProperty({
    description: 'Query',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  query?: string;
}
