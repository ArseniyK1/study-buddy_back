import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, genSalt, hash } from 'bcrypt';
import { PrismaService } from './prisma.service';
import { TRPCError } from '@trpc/server';
import { t } from './trpc/trpc.config';
import { getAllUsers } from '@prisma/client/sql';
import { signInSchema } from './schemas/sign-in.schema';
import { signUpSchema } from './schemas/sign-up.schema';
import { profileSchema } from './schemas/profile.schema';
import { usersSchema } from './schemas/users.schema';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  public router = t.router({
    signIn: t.procedure.input(signInSchema).mutation(async ({ input }) => {
      const user = await this.findOne(input.email);
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Пользователь не найден!',
        });
      }

      const areEqual = await compare(
        input.password.toString(),
        user.password.toString(),
      );

      if (!areEqual) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Неправильный пароль!',
        });
      }

      const role = await this.prisma.role.findUnique({
        where: { id: +user.role_id },
      });

      const payload = {
        userId: user.id,
        username: user.email,
        role: role?.value,
      };

      return {
        accessToken: await this.jwtService.signAsync(payload),
      };
    }),

    signUp: t.procedure.input(signUpSchema).mutation(async ({ input }) => {
      const user = await this.findOne(input.email);
      if (!!user?.id) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Пользователь с таким email уже существует!',
        });
      }

      const salt = await genSalt(10);
      const hashPassword = await hash(input.password, salt);

      const newUser = await this.prisma.auth_user.create({
        data: {
          email: input.email,
          password: hashPassword,
          first_name: input.name?.first_name || '',
          second_name: input.name?.second_name || '',
          middle_name: input.name?.middle_name || '',
          role_id: 1,
        },
      });

      const payload = {
        userId: newUser.id,
        username: newUser.email,
        role: newUser.role_id,
      };

      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    }),

    getProfile: t.procedure.input(profileSchema).query(async ({ input }) => {
      const user = await this.prisma.auth_user.findUnique({
        where: { id: input.user_id },
      });
      return !!user?.id
        ? { ...user, middle_name: user.middle_name || '' }
        : null;
    }),

    findAllUsers: t.procedure.input(usersSchema).query(async ({ input }) => {
      return await this.prisma.$queryRawTyped(
        getAllUsers(input.name_filter || '', 0, 100),
      );
    }),
  });

  private async findOne(email: string) {
    const user = await this.prisma.auth_user.findUnique({
      where: { email },
    });
    return !!user?.id ? user : null;
  }
}
