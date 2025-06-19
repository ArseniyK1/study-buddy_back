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
  UpdateUserRequest,
} from 'shared/generated/auth';
import { RpcException } from '@nestjs/microservices';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { getAllUsers } from '@prisma/client/sql';
import { SignUpDto } from '@app/api/auth/dto/sing-up.dto';
import { IRequest } from '@shared/types/IRequest.interface';
import { Role as RoleEnum } from '@shared/types/roles.enum';

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
      banned: user.banned,
      reasonBanned: user.reason_banned || '',
    };
  }

  async signUp(
    dto: SignUpRequest,
    currentUserId?: number,
  ): Promise<AuthResponse> {
    if (!dto.roleId) {
      throw new RpcException({
        code: Status.INVALID_ARGUMENT,
        message: 'Role ID is required!',
      });
    }
    const user = await this.findOne(dto.email);
    if (!!user?.id) {
      throw new RpcException({
        code: Status.ALREADY_EXISTS,
        message: 'Пользователь с таким email уже существует!',
      });
    }

    const salt = await genSalt(10);
    const hashPassword = await hash(dto.password, salt);

    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashPassword,
        firstName: dto.name?.firstName || '',
        lastName: dto.name?.lastName || '',
        middleName: dto.name?.middleName || '',
        phone: dto.phone,
        roleId: Number(dto.roleId),
      },
      include: {
        role: true,
      },
    });

    if (!!dto.workspaceId && dto.roleId === 3) {
      await this.prisma.workspaceManager.create({
        data: {
          managerId: newUser.id,
          workspaceId: dto.workspaceId,
        },
      });
    }

    if (!!dto.workspaceId && dto.roleId === 2) {
      await this.prisma.workspace.update({
        data: {
          ownerId: newUser.id,
        },
        where: {
          id: dto.workspaceId,
        },
      });
    }

    const payload = {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role.value,
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
    console.log(dto);
    const users = await this.prisma.$queryRawTyped(
      getAllUsers(
        dto.nameFilter || '',
        dto.isBanned ?? false,
        dto.hasTelegram ?? false,
        dto.roleId ?? 0,
        dto.offset ?? 0,
        dto.limit ?? 100,
        +dto.currentRoleId,
      ),
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
        banned: user.banned || false,
        reasonBanned: user.reason_banned || '', // <-- fix here
        telegramId: user.telegram_id,
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

  async updateUserInfo(
    dto: UpdateUserRequest,
    currentUserRole: string,
  ): Promise<User> {
    console.log(currentUserRole);
    const user = await this.prisma.user.findUnique({
      where: { id: dto.id },
      include: { role: true },
    });

    if (!user) {
      throw new RpcException({
        code: Status.NOT_FOUND,
        message: 'Пользователь не найден!',
      });
    }

    const updateData: {
      email: string;
      firstName: string;
      lastName: string;
      middleName: string | null;
      phone: string;
      roleId: number;
      banned?: boolean;
      reason_banned?: string | null;
    } = {
      email: dto.userInfo?.email || user.email,
      firstName: dto.userInfo?.name?.firstName || user.firstName,
      lastName: dto.userInfo?.name?.lastName || user.lastName,
      middleName: dto.userInfo?.name?.middleName || user.middleName,
      phone: dto.userInfo?.phone || user.phone,
      roleId: dto.userInfo?.roleId || user.roleId,
    };

    // Only allow ban operations for admin and superadmin roles
    if (dto.banReason !== undefined || dto.isBanned !== undefined) {
      if (
        currentUserRole !== RoleEnum.ADMIN &&
        currentUserRole !== RoleEnum.SUPER_ADMIN
      ) {
        throw new RpcException({
          code: Status.PERMISSION_DENIED,
          message: 'У вас нет прав для выполнения этой операции!',
        });
      }

      updateData.banned = dto.isBanned ?? user.banned;
      updateData.reason_banned = dto.banReason || user.reason_banned;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: dto.id },
      data: updateData,
      include: {
        role: true,
      },
    });

    return {
      ...updatedUser,
      middleName: updatedUser.middleName || undefined,
      role: updatedUser.role as unknown as Role,
      banned: user.banned,
      reasonBanned: user.reason_banned || '',
    };
  }
}
