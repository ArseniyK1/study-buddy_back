// src/auth/dto/link-telegram.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LinkTelegramDto {
  @ApiProperty({ description: 'Telegram auth data from widget' })
  @IsNotEmpty()
  @IsString()
  authData: string;
}
