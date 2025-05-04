import { ApiProperty } from '@nestjs/swagger';
import { IsDate } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class WorkplaceByIdDto {
  @ApiProperty({ description: 'Дата начала', example: '2025-01-01' })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  startDate?: string;

  @ApiProperty({ description: 'Дата окончания', example: '2025-01-01' })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  endDate?: string;
}
