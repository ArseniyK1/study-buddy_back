import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WorkspaceZoneResponseDto {
  @ApiProperty({ description: 'Zone ID' })
  id: number;

  @ApiProperty({ description: 'Zone name' })
  name: string;

  @ApiPropertyOptional({ description: 'Zone description' })
  description?: string;

  @ApiProperty({ description: 'Price per hour for the zone' })
  pricePerHour: number;

  @ApiProperty({ description: 'Maximum number of places in the zone' })
  maxPlaces: number;
}

export class PlaceResponseDto {
  @ApiProperty({ description: 'Place ID' })
  id: number;

  @ApiProperty({ description: 'Place name' })
  name: string;

  @ApiPropertyOptional({ description: 'Place description' })
  description?: string;

  @ApiProperty({ description: 'Place status' })
  status: string;

  @ApiPropertyOptional({ description: 'Zone ID this place belongs to' })
  zoneId?: number;

  @ApiPropertyOptional({ description: 'Zone information' })
  zone?: WorkspaceZoneResponseDto;
}
