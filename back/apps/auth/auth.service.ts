import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, genSalt, hash } from 'bcrypt';
import { PrismaService } from './prisma.service';
import {
  AuthResponse,
  FindAllUsersRequest,
  GetProfileRequest,
  SignInRequest,
  SignUpRequest,
  User,
  UserListResponse,
  Role,
  SignInWithTelegramRequest,
  LinkTelegramAccountRequest,
} from 'shared/generated/auth';
import { RpcException } from '@nestjs/microservices';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { getAllUsers } from '@prisma/client/sql';
import { createHash } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signIn(dto: SignInRequest): Promise<AuthResponse> {
    const user = await this.findOne(dto.email);
    if (!user) {
      throw new RpcException({
        code: Status.NOT_FOUND,
        message: 'Пользователь не найден!',
      });
    }
    const areEqual = await compare(
      dto.password.toString(),
      user.password.toString(),
    );
    if (!areEqual) {
      throw new RpcException({
        code: Status.UNAUTHENTICATED,
        message: 'Неправильный пароль!',
      });
    }
    const role = await this.prisma.role.findUnique({
      where: { id: +user.roleId },
    });
    const payload = {
      userId: user.id,
      email: user.email,
      role: role?.value,
    };
    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: '24h',
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: '30d',
      }),
    };
  }

  async findOne(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return !!user?.id ? user : null;
  }

  async getProfile(data: GetProfileRequest): Promise<User> {
    if (!data.id) {
      throw new RpcException({
        code: Status.INVALID_ARGUMENT,
        message: 'ID пользователя не указан!',
      });
    }
    const user = await this.prisma.user.findUnique({
      where: { id: +data.id },
      include: {
        role: true,
      },
    });
    console.log('user', user);
    if (!user) {
      throw new RpcException({
        code: Status.NOT_FOUND,
        message: 'Пользователь не найден!',
      });
    }
    return {
      ...user,
      middleName: user.middleName || undefined,
      role: user.role as unknown as Role,
    };
  }

  async signUp(dto: SignUpRequest): Promise<AuthResponse> {
    const user = await this.findOne(dto.email);
    if (!!user?.id) {
      throw new RpcException({
        code: Status.ALREADY_EXISTS,
        message: 'Пользователь с таким email уже существует!',
      });
    }
    const salt = await genSalt(10);
    const hashPassword = await hash(dto.password, salt); // bycrypt создаёт хеш пароля
    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashPassword,
        firstName: dto.name?.firstName || '',
        lastName: dto.name?.lastName || '',
        middleName: dto.name?.middleName,
        phone: dto.phone,
        roleId: 1,
      },
    });

    const payload = {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.roleId,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: '24h',
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: '30d',
      }),
    };
  }

  async findAllUsers(dto: FindAllUsersRequest): Promise<UserListResponse> {
    const users = await this.prisma.$queryRawTyped(
      getAllUsers(dto.nameFilter || '', 0, 100),
    );

    return {
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        middleName: user.middle_name || undefined,
        phone: user.phone,
        role: user.role as unknown as Role,
      })),
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
        include: { role: true },
      });

      if (!user) {
        throw new RpcException({
          code: Status.NOT_FOUND,
          message: 'Пользователь не найден!',
        });
      }

      const newPayload = {
        userId: user.id,
        username: user.email,
        role: user.role.value,
      };

      return {
        accessToken: await this.jwtService.signAsync(newPayload, {
          expiresIn: '60s',
        }),
        refreshToken: await this.jwtService.signAsync(newPayload, {
          expiresIn: '30d',
        }),
      };
    } catch {
      throw new RpcException({
        code: Status.UNAUTHENTICATED,
        message: 'Недействительный refresh token!',
      });
    }
  }

  private verifyTelegramHash(data: {
    telegramId: string;
    firstName: string;
    lastName: string;
    username: string;
    photoUrl: string;
    authDate: string;
    hash: string;
  }): boolean {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      throw new RpcException({
        code: Status.INTERNAL,
        message: 'Telegram bot token not configured',
      });
    }

    const checkString = Object.entries(data)
      .filter(([key]) => key !== 'hash')
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secretKey = createHash('sha256').update(botToken).digest();

    const calculatedHash = createHash('sha256')
      .update(secretKey)
      .update(checkString)
      .digest('hex');

    return calculatedHash === data.hash;
  }

  async signInWithTelegram(
    data: SignInWithTelegramRequest,
  ): Promise<AuthResponse> {
    if (!this.verifyTelegramHash(data)) {
      throw new RpcException({
        code: Status.UNAUTHENTICATED,
        message: 'Invalid Telegram authentication data',
      });
    }

    let user = await this.prisma.user.findFirst({
      where: { telegramId: data.telegramId },
      include: { role: true },
    });

    if (!user) {
      // Create new user if not exists
      user = await this.prisma.user.create({
        data: {
          email: `${data.telegramId}@telegram.user`,
          password: '', // Empty password for Telegram users
          firstName: data.firstName,
          lastName: data.lastName,
          telegramId: data.telegramId,
          telegramUsername: data.username,
          roleId: 1, // Default role
        },
        include: { role: true },
      });
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role.value,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: '24h',
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: '30d',
      }),
    };
  }

  async linkTelegramAccount(
    data: LinkTelegramAccountRequest,
  ): Promise<AuthResponse> {
    if (!this.verifyTelegramHash(data)) {
      throw new RpcException({
        code: Status.UNAUTHENTICATED,
        message: 'Invalid Telegram authentication data',
      });
    }

    const user = await this.prisma.user.findUnique({
      where: { id: +data.userId },
      include: { role: true },
    });

    if (!user) {
      throw new RpcException({
        code: Status.NOT_FOUND,
        message: 'User not found',
      });
    }

    // Update user with Telegram data
    await this.prisma.user.update({
      where: { id: +data.userId },
      data: {
        telegramId: data.telegramId,
        telegramUsername: data.username,
      },
    });

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role.value,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: '24h',
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: '30d',
      }),
    };
  }
}
