import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { faker } from '@faker-js/faker';

export class CreateWorkspaceDto {
  @ApiProperty({
    description: 'Название рабочего пространства',
    example: faker.company.name(),
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Физический адрес рабочего пространства',
    example: faker.location.streetAddress(),
  })
  @IsString()
  address: string;

  @ApiPropertyOptional({
    description: 'Описание рабочего пространства',
    example: faker.lorem.paragraph(),
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Максимальная вместимость рабочего пространства',
    example: faker.number.int({ min: 10, max: 100 }),
  })
  @IsNumber()
  capacity: number;

  @ApiPropertyOptional({
    description: 'Доступные удобства в рабочем пространстве',
    example: faker.lorem.words(5),
  })
  @IsString()
  @IsOptional()
  amenities?: string;

  @ApiProperty({
    description: 'ID владельца рабочего пространства',
    example: faker.number.int({ min: 1, max: 100 }),
  })
  @IsNumber()
  ownerId: number;
}
