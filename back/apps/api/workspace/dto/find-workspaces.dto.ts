import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindWorkspacesDto {
  @ApiProperty({
    required: false,
    description: 'Поисковый запрос',
  })
  @IsString()
  @IsOptional()
  query?: string;

  @ApiProperty({
    required: false,
    description: 'Статус одобрения (true/false)',
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  status?: boolean;

  @ApiProperty({
    required: true,
    description: 'Смещение',
  })
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  offset: number;

  @ApiProperty({
    required: true,
    description: 'Лимит',
  })
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  limit: number;
}
