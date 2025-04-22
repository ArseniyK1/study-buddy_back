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
      username: user.email,
      role: role?.value,
    };
    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  async findOne(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return !!user?.id ? user : null;
  }

  async getProfile(data: GetProfileRequest): Promise<User> {
    console.log('id', data);
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
      username: newUser.email,
      role: newUser.roleId,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
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
}
