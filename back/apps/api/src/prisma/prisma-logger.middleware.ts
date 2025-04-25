import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import * as chalk from 'chalk';

@Injectable()
export class PrismaLoggerMiddleware {
  constructor(private readonly logger: LoggerService) {}

  /**
   * Обработчик события запроса Prisma
   * @param event Событие запроса Prisma
   */
  handleQuery(event: any) {
    const { query, params, duration } = event;

    this.logger.logDatabaseQuery(
      query,
      params ? JSON.parse(params) : [],
      chalk.magenta('Prisma:Query'),
    );

    this.logger.log(
      chalk.magenta(
        `[${new Date().toISOString()}] Prisma query completed in ${duration}ms`,
      ),
      chalk.magenta('Prisma:Query'),
    );
  }
}
