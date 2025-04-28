import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { SignInRequest } from 'shared/generated/auth';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto implements SignInRequest {
  @ApiProperty({
    description: 'User email address',
    example: 'Shayne85@gmail.com',
    format: 'email',
  })
  @IsString({ message: 'Поле email должно быть типа STRING' })
  @IsEmail()
  @IsNotEmpty({ message: 'Поле email не должно быть пустым' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'test',
    format: 'password',
  })
  @IsString({ message: 'Поле password должно быть типа STRING' })
  @IsNotEmpty({ message: 'Поле password не должно быть пустым' })
  password: string;
}
