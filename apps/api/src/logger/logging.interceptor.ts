import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { LoggerService } from './logger.service';
import { Request } from 'express';
import * as chalk from 'chalk';

// Extend the Express Request type to include the user property
interface RequestWithUser extends Request {
  user?: {
    userId: string | number;
    [key: string]: any;
  };
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const { method, url } = request;

    // Log the incoming request
    this.logger.logRequest(request, 'Request');

    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        // Log the response time
        const responseTime = Date.now() - now;
        this.logger.log(
          chalk.blue(
            `[${new Date().toISOString()}] ${method} ${url} completed in ${responseTime}ms`,
          ),
          'Response',
        );
      }),
      catchError((error) => {
        // Log any errors
        this.logger.logError(error, request, 'Error');
        throw error;
      }),
    );
  }
}
