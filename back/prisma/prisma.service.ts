import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaLoggerMiddleware } from './prisma-logger.middleware';
import { PrismaSoftDeleteMiddleware } from './prisma-soft-delete.middleware';
import { LoggerService } from '@app/api/common/logger/logger.service';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private prismaLoggerMiddleware: PrismaLoggerMiddleware;
  private prismaSoftDeleteMiddleware: PrismaSoftDeleteMiddleware;

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
    this.prismaSoftDeleteMiddleware = new PrismaSoftDeleteMiddleware(logger);

    (this as any).$on('query', (e: Prisma.QueryEvent) => {
      this.prismaLoggerMiddleware.handleQuery(e);
    });
  }

  async onModuleInit() {
    // Регистрируем middleware для мягкого удаления
    this.$extends({
      query: {
        $allOperations({ operation, model, args, query }) {
          console.log(operation, model, args, query);
          return this.prismaSoftDeleteMiddleware.handle(
            { model, action: operation, args },
            (params: Prisma.MiddlewareParams) => query(params),
          );
        },
      },
    });

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
