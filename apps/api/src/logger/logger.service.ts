import { Injectable, ConsoleLogger, Scope } from '@nestjs/common';
import { Request } from 'express';
import * as chalk from 'chalk';

// Extend the Express Request type to include the user property
interface RequestWithUser extends Request {
  user?: {
    userId: string | number;
    [key: string]: any;
  };
}

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService extends ConsoleLogger {
  logRequest(request: RequestWithUser, context?: string) {
    const clientIp = this.getClientIp(request);
    const userAgent = request.headers['user-agent'] || 'Unknown';
    const userId = request.user?.userId || 'Anonymous';
    const timestamp = new Date().toISOString();
    const method = request.method;
    const url = request.originalUrl;

    const logMessage = `[${timestamp}] ${method} ${url} | Client: ${clientIp} | User: ${userId} | User-Agent: ${userAgent}`;

    this.log(logMessage, context);
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

    this.error(logMessage, errorStack, context);
  }

  logDatabaseQuery(query: string, params: any[], context?: string) {
    const timestamp = new Date().toISOString();
    const paramCount = params ? params.length : 0;
    const paramValues = params ? JSON.stringify(params) : '[]';

    // Используем цветное форматирование, если context уже содержит цветные символы
    const formattedContext =
      context && context.includes('\u001b')
        ? context
        : chalk.cyan(context || 'Database');

    const logMessage = `[${timestamp}] Выполнен запрос к БД: ${query} | params=${paramCount}, values: ${paramValues}`;

    this.log(logMessage, formattedContext);
  }

  private getClientIp(request: Request): string {
    // Try to get IP from various headers
    const ip =
      request.headers['x-forwarded-for'] ||
      request.headers['x-real-ip'] ||
      request.socket.remoteAddress ||
      'Unknown';

    // If it's an array, take the first IP
    return Array.isArray(ip) ? ip[0] : ip;
  }
}
