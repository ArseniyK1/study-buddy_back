import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkspaceDto {
  @ApiProperty({ description: 'Name of the workspace' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Physical address of the workspace' })
  @IsString()
  address: string;

  @ApiPropertyOptional({ description: 'Description of the workspace' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Maximum capacity of the workspace' })
  @IsNumber()
  capacity: number;

  @ApiPropertyOptional({ description: 'Available amenities in the workspace' })
  @IsString()
  @IsOptional()
  amenities?: string;

  @ApiProperty({ description: 'ID of the workspace owner' })
  @IsNumber()
  ownerId: number;
}
