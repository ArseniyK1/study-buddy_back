// src/auth/telegram.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '@prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TelegramService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateTelegramAuth(data: any): Promise<boolean> {
    const botToken = this.configService.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) throw new Error('Telegram bot token not configured');

    const secretKey = crypto.createHash('sha256').update(botToken).digest();

    const checkString = Object.keys(data)
      .filter((key) => key !== 'hash')
      .sort()
      .map((key) => `${key}=${data[key]}`)
      .join('\n');

    const hmac = crypto
      .createHmac('sha256', secretKey)
      .update(checkString)
      .digest('hex');

    return hmac === data.hash;
  }

  async findUserByTelegramId(telegramId: string) {
    return this.prisma.user.findUnique({
      where: { telegramId },
      include: { role: true },
    });
  }

  async linkTelegramToUser(userId: number, telegramData: any) {
    // Проверяем, не привязан ли уже этот Telegram к другому пользователю
    const existingUser = await this.prisma.user.findFirst({
      where: { telegramId: telegramData.id.toString() },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new Error(
        'This Telegram account is already linked to another user',
      );
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        telegramId: telegramData.id.toString(),
        telegramUsername: telegramData.username,
        firstName: telegramData.first_name,
        lastName: telegramData.last_name || '',
      },
      include: { role: true },
    });
  }

  generateJwtToken(user: any) {
    const payload = {
      userId: user.id,
      role: user.role?.value || 'USER',
      telegramId: user.telegramId,
    };
    return this.jwtService.sign(payload);
  }
}
