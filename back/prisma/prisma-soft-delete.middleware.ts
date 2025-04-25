import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { LoggerService } from '@app/api/common/logger/logger.service';

@Injectable()
export class PrismaSoftDeleteMiddleware {
  constructor(private readonly logger: LoggerService) {}

  /**
   * Middleware для реализации мягкого удаления (soft delete)
   * Перехватывает запросы на удаление и заменяет их на обновление поля deletedAt
   * @param params Параметры запроса Prisma
   * @param next Функция для продолжения выполнения запроса
   */
  async handle(
    params: Prisma.MiddlewareParams,
    next: (params: Prisma.MiddlewareParams) => Promise<any>,
  ) {
    // Проверяем, что запрос относится к модели WorkspaceManager
    if (params.model === 'WorkspaceManager') {
      // Обработка запроса на удаление одной записи
      if (params.action === 'delete') {
        this.logger.log(
          `Soft delete: Запрос на удаление записи WorkspaceManager перехвачен и преобразован в обновление`,
          'PrismaSoftDelete',
        );

        // Заменяем действие delete на update
        params.action = 'update';

        // Устанавливаем поле deletedAt в текущую дату
        params.args.data = {
          deletedAt: new Date(),
        };
      }

      // Обработка запроса на удаление множества записей
      if (params.action === 'deleteMany') {
        this.logger.log(
          `Soft delete: Запрос на массовое удаление записей WorkspaceManager перехвачен и преобразован в обновление`,
          'PrismaSoftDelete',
        );

        // Заменяем действие deleteMany на updateMany
        params.action = 'updateMany';

        // Устанавливаем поле deletedAt в текущую дату
        if (params.args.data !== undefined) {
          params.args.data.deletedAt = new Date();
        } else {
          params.args.data = { deletedAt: new Date() };
        }
      }

      // Фильтрация запросов на получение данных - исключаем "удаленные" записи
      if (params.action === 'findUnique' || params.action === 'findFirst') {
        // Добавляем условие deletedAt: null в where
        params.args.where = {
          ...params.args.where,
          deletedAt: null,
        };
      }

      if (params.action === 'findMany') {
        // Если where уже существует, добавляем условие deletedAt: null
        if (params.args.where) {
          params.args.where = {
            ...params.args.where,
            deletedAt: null,
          };
        } else {
          // Иначе создаем where с условием deletedAt: null
          params.args.where = {
            deletedAt: null,
          };
        }
      }
    }

    // Продолжаем выполнение запроса
    return next(params);
  }
}
