import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/guard/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { LoggerModule } from './common/logger/logger.module';
import { WorkplaceModule } from './workplace/workplace.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { WorkspaceZoneModule } from './workspace-zone/workspace-zone.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { RolesGuard } from './auth/guard/roles.guard';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule,
    WorkplaceModule,
    PrismaModule,
    WorkspaceZoneModule,
    WorkspaceModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    JwtService,
  ],
})
export class ApiModule {}
