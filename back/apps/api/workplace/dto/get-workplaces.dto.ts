import { IsBoolean, IsInt, IsString } from 'class-validator';

import { IsNotEmpty } from 'class-validator';

import { FindWorkspacesDto } from '@app/api/workspace/dto/find-workspaces.dto';
import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetWorkplacesDto implements FindWorkspacesDto {
  @ApiProperty({
    required: false,
    description: 'Поисковый запрос',
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({
    required: false,
    description: 'Статус одобрения (true/false)',
  })
  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  status?: boolean;

  @IsOptional()
  @IsInt()
  @IsNotEmpty()
  offset: number;

  @IsOptional()
  @IsInt()
  @IsNotEmpty()
  limit: number;
}
