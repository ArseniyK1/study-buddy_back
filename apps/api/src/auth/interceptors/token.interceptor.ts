import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { JwtService } from '@nestjs/jwt';
import { ClientGrpc } from '@nestjs/microservices';
import { AuthServiceClient } from 'shared/generated/auth';
import { Metadata } from '@grpc/grpc-js';

@Injectable()
export class TokenInterceptor implements NestInterceptor {
  private authService: AuthServiceClient;

  constructor(
    private jwtService: JwtService,
    private client: ClientGrpc,
  ) {
    this.authService = this.client.getService<AuthServiceClient>('AuthService');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.cookies?.refreshToken;

    return next.handle().pipe(
      catchError((error) => {
        if (error.status === 401 && refreshToken) {
          return this.authService
            .refreshToken({ refreshToken }, new Metadata())
            .pipe(
              switchMap((response) => {
                // Обновляем access token в заголовке
                request.headers.authorization = `Bearer ${response.accessToken}`;
                // Обновляем refresh token в куках
                request.res.cookie('refreshToken', response.refreshToken, {
                  httpOnly: true,
                  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
                });
                // Повторяем оригинальный запрос с новым токеном
                return next.handle();
              }),
            );
        }
        return throwError(() => error);
      }),
    );
  }
}
