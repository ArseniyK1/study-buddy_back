import { IsString, IsOptional, IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlaceDto {
  @ApiProperty({ description: 'Name of the place' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Description of the place' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Status of the place (e.g., AVAILABLE, OCCUPIED, MAINTENANCE)',
  })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiPropertyOptional({
    description: 'ID of the workspace zone this place belongs to',
  })
  @IsInt()
  @IsOptional()
  zoneId?: number;
}
