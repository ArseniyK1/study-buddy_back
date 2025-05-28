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
} from 'shared/generated/auth';
import { RpcException } from '@nestjs/microservices';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { getAllUsers } from '@prisma/client/sql';
import { SignUpDto } from '@app/api/auth/dto/sing-up.dto';

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
    };
  }

  async signUp(
    dto: SignUpRequest,
    currentUserId?: number,
  ): Promise<AuthResponse> {
    const user = await this.findOne(dto.email);
    if (!!user?.id) {
      throw new RpcException({
        code: Status.ALREADY_EXISTS,
        message: 'Пользователь с таким email уже существует!',
      });
    }

    // Если есть currentUserId, значит это создание пользователя с правами
    if (currentUserId) {
      const currentUser = await this.prisma.user.findUnique({
        where: { id: currentUserId },
        include: { role: true },
      });

      if (!currentUser) {
        throw new RpcException({
          code: Status.NOT_FOUND,
          message: 'Текущий пользователь не найден!',
        });
      }

      // Проверяем права на создание пользователя
      if (currentUser.role.value === 'SUPER_ADMIN') {
        // Супер админ может создавать любых пользователей, кроме супер админов
        const role = await this.prisma.role.findUnique({
          where: { id: dto.roleId },
        });

        if (!role || role.value === 'SUPER_ADMIN') {
          throw new RpcException({
            code: Status.PERMISSION_DENIED,
            message: 'Нельзя создать пользователя с такой ролью!',
          });
        }
      } else if (currentUser.role.value === 'ADMIN') {
        // Админ может создавать только менеджеров в своем коворкинге
        if (!dto.workspaceId) {
          throw new RpcException({
            code: Status.INVALID_ARGUMENT,
            message: 'Необходимо указать коворкинг!',
          });
        }

        const userWorkspaces = await this.getUserWorkspaces(currentUserId);
        if (!userWorkspaces.some((w) => w.id === dto.workspaceId)) {
          throw new RpcException({
            code: Status.PERMISSION_DENIED,
            message:
              'У вас нет прав на создание пользователей в этом коворкинге!',
          });
        }

        const managerRole = await this.prisma.role.findFirst({
          where: { value: 'MANAGER' },
        });

        if (!managerRole) {
          throw new RpcException({
            code: Status.INTERNAL,
            message: 'Роль менеджера не найдена!',
          });
        }

        dto.roleId = managerRole.id;
      } else {
        throw new RpcException({
          code: Status.PERMISSION_DENIED,
          message: 'У вас нет прав на создание пользователей!',
        });
      }
    } else {
      // Обычная регистрация - только USER роль
      const userRole = await this.prisma.role.findFirst({
        where: { value: 'USER' },
      });

      if (!userRole) {
        throw new RpcException({
          code: Status.INTERNAL,
          message: 'Роль пользователя не найдена!',
        });
      }

      dto.roleId = userRole.id;
    }

    const role = await this.prisma.role.findUnique({
      where: { id: dto.roleId },
    });

    if (!role) {
      throw new RpcException({
        code: Status.INVALID_ARGUMENT,
        message: 'Указана несуществующая роль!',
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
        roleId: role.id,
      },
    });

    // Если указан workspaceId и роль MANAGER, создаем связь с коворкингом
    if (dto.workspaceId && role.value === 'MANAGER') {
      await this.prisma.workspaceManager.create({
        data: {
          workspaceId: dto.workspaceId,
          managerId: newUser.id,
        },
      });
    }

    const payload = {
      userId: newUser.id,
      email: newUser.email,
      role: role.value,
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
      getAllUsers(
        dto.nameFilter || '',
        dto.isBanned ?? false,
        dto.hasTelegram ?? false,
        dto.roleId ?? 0,
        dto.offset ?? 0,
        dto.limit ?? 100,
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

  // Новый метод для получения коворкингов пользователя
  async getUserWorkspaces(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        workspaces: true, // Коворкинги, где пользователь владелец
        managedWorkspaces: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!user) {
      throw new RpcException({
        code: Status.NOT_FOUND,
        message: 'Пользователь не найден!',
      });
    }

    // Объединяем коворкинги, где пользователь владелец и менеджер
    const ownedWorkspaces = user.workspaces;
    const managedWorkspaces = user.managedWorkspaces.map((wm) => wm.workspace);

    return [...ownedWorkspaces, ...managedWorkspaces];
  }
}
