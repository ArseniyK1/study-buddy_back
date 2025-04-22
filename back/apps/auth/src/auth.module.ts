import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from './prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { TrpcService } from './trpc/trpc.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, PrismaService, TrpcService],
})
export class AuthModule {}
