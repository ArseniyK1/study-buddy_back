import { Injectable, ConsoleLogger, Scope } from '@nestjs/common';
import { Request } from 'express';
import * as chalk from 'chalk';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';

// Extend the Express Request type to include the user property
interface RequestWithUser extends Request {
  user?: {
    userId: string | number;
    [key: string]: any;
  };
}

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService extends ConsoleLogger {
  constructor(private readonly elasticsearchService: ElasticsearchService) {
    super();
  }

  logRequest(request: RequestWithUser, context?: string) {
    const clientIp = this.getClientIp(request);
    const userAgent = request.headers['user-agent'] || 'Unknown';
    const userId = request.user?.userId || 'Anonymous';
    const timestamp = new Date().toISOString();
    const method = request.method;
    const url = request.originalUrl;

    const logMessage = `[${timestamp}] ${method} ${url} | Client: ${clientIp} | User: ${userId} | User-Agent: ${userAgent}`;

    // Логируем в консоль
    this.log(logMessage, context);

    // Отправляем в Elasticsearch
    this.elasticsearchService.saveLog({
      level: 'info',
      message: logMessage,
      context: context || 'Request',
      method,
      url,
      clientIp,
      userId,
      userAgent,
    });
  }

  logError(error: any, request: RequestWithUser, context?: string) {
    const clientIp = this.getClientIp(request);
    const userId = request.user?.userId || 'Anonymous';
    const timestamp = new Date().toISOString();
    const method = request.method;
    const url = request.originalUrl;

    const errorMessage = error.message || 'Unknown error';
    const errorStack = error.stack || '';

    const logMessage = `[${timestamp}] ERROR ${method} ${url} | Client: ${clientIp} | User: ${userId} | Error: ${errorMessage}`;

    // Логируем в консоль
    this.error(logMessage, errorStack, context);

    // Отправляем в Elasticsearch
    this.elasticsearchService.saveLog({
      level: 'error',
      message: logMessage,
      context: context || 'Error',
      method,
      url,
      clientIp,
      userId,
      errorMessage,
      errorStack,
    });
  }

  logDatabaseQuery(query: string, params: any[], context?: string) {
    const timestamp = new Date().toISOString();
    const paramCount = params ? params.length : 0;
    const paramValues = params ? JSON.stringify(params) : '[]';

    const formattedContext =
      context && context.includes('\u001b')
        ? context
        : chalk.cyan(context || 'Database');
    const formattedQuery = chalk.hex('#f5f5dc')(query);
    const logMessage = `[${timestamp}] Выполнен запрос к БД: ${formattedQuery} | params=${paramCount}, values: ${paramValues}`;

    // Логируем в консоль
    this.log(logMessage, formattedContext);

    // Отправляем в Elasticsearch
    this.elasticsearchService.saveLog({
      level: 'info',
      message: logMessage,
      context: context || 'Database',
      query,
      params: paramValues,
    });
  }

  private getClientIp(request: Request): string {
    const ip =
      request.headers['x-forwarded-for'] ||
      request.headers['x-real-ip'] ||
      request.socket.remoteAddress ||
      'Unknown';

    return Array.isArray(ip) ? ip[0] : ip;
  }
}
