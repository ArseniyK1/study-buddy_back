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
  @ApiProperty({ description: 'ID рабочего места' })
  id: number;

  @ApiProperty({ description: 'Название рабочего места' })
  name: string;

  @ApiPropertyOptional({ description: 'Описание рабочего места' })
  description?: string;

  @ApiProperty({ description: 'Статус рабочего места' })
  status: string;

  @ApiPropertyOptional({
    description: 'ID зоны, к которой относится рабочее место',
  })
  zoneId?: number;

  @ApiPropertyOptional({ description: 'Информация о зоне' })
  zone?: WorkspaceZoneResponseDto;
}
