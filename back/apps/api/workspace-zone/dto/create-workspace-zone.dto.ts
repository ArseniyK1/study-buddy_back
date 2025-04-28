import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkspaceZoneDto {
  @ApiProperty({ description: 'Name of the workspace zone' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Description of the workspace zone' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Price per hour for using the zone', minimum: 0 })
  @IsNumber()
  @Min(0)
  pricePerHour: number;

  @ApiProperty({
    description: 'Maximum number of places in the zone',
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  maxPlaces: number;

  @ApiProperty({ description: 'ID of the workspace this zone belongs to' })
  @IsNumber()
  workspaceId: number;
}
