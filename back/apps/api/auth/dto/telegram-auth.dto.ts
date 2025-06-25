// src/auth/dto/telegram-auth.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class TelegramAuthDto {
  @ApiProperty({ description: 'Telegram user ID' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ description: 'Telegram username (optional)' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ description: 'First name from Telegram' })
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @ApiProperty({ description: 'Last name from Telegram (optional)' })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiProperty({ description: 'Telegram auth hash for verification' })
  @IsNotEmpty()
  @IsString()
  hash: string;
}
