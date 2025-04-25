import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SignUpRequest, User } from 'shared/generated/auth';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class UserNameDto implements Omit<User, 'id' | 'role' | 'email' | 'phone'> {
  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @IsString({ message: 'Поле firstName должно быть типа STRING' })
  @IsNotEmpty({ message: 'Поле firstName не должно быть пустым' })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @IsString({ message: 'Поле lastName должно быть типа STRING' })
  @IsNotEmpty({ message: 'Поле lastName не должно быть пустым' })
  lastName: string;

  @ApiPropertyOptional({
    description: 'User middle name',
    example: 'Michael',
  })
  @IsString({ message: 'Поле middleName должно быть типа STRING' })
  @IsOptional()
  middleName?: string | undefined;
}

export class SignUpDto implements SignUpRequest {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @IsString({ message: 'Поле email должно быть типа STRING' })
  @IsEmail()
  @IsNotEmpty({ message: 'Поле email не должно быть пустым' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    format: 'password',
  })
  @IsString({ message: 'Поле password должно быть типа STRING' })
  @IsNotEmpty({ message: 'Поле password не должно быть пустым' })
  password: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
  })
  @IsString({ message: 'Поле phone должно быть типа STRING' })
  @IsNotEmpty({ message: 'Поле phone не должно быть пустым' })
  phone: string;

  @ApiProperty({
    description: 'User name information',
    type: UserNameDto,
  })
  @ValidateNested()
  @Type(() => UserNameDto)
  @IsNotEmpty({ message: 'Поле name не должно быть пустым' })
  name: UserNameDto;

  @ApiPropertyOptional({
    description: 'User role ID',
    example: 1,
  })
  @IsNumber({}, { message: 'Поле roleId должно быть типа NUMBER' })
  @IsOptional()
  roleId?: number;
}
