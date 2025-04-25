import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaLoggerMiddleware } from './prisma-logger.middleware';
import { LoggerService } from '../apps/api/src/common/logger/logger.service';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private prismaLoggerMiddleware: PrismaLoggerMiddleware;

  constructor(private readonly logger: LoggerService) {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
      ],
    });

    this.prismaLoggerMiddleware = new PrismaLoggerMiddleware(logger);

    (this as any).$on('query', (e: Prisma.QueryEvent) => {
      this.prismaLoggerMiddleware.handleQuery(e);
    });
  }

  async onModuleInit() {
    await this.$connect();

    this.logger.log(
      'PrismaService initialized and connected to database',
      'PrismaService',
    );
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log(
      'PrismaService disconnected from database',
      'PrismaService',
    );
  }
}
