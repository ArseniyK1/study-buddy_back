import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { faker } from '@faker-js/faker';

export class AddManagerDto {
  @ApiProperty({
    description: 'ID пользователя, которого нужно назначить менеджером',
    example: faker.number.int({ min: 1, max: 100 }),
  })
  @IsNumber()
  managerId: number;
}
