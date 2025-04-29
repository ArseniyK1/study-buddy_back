import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ClientGrpc } from '@nestjs/microservices';
import { AuthServiceClient } from 'shared/generated/auth';
import { Metadata } from '@grpc/grpc-js';
import { handleRequest } from '../../common/grpc/grpc.handle';

@Injectable()
export class TokenInterceptor implements NestInterceptor {
  private authService: AuthServiceClient;

  constructor(@Inject('GRPC_SERVICE') private client: ClientGrpc) {
    this.authService = this.client.getService<AuthServiceClient>('AuthService');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    let refreshToken = request.cookies?.refreshToken;

    // Если refreshToken не найден в cookies, пробуем получить из заголовка Cookie
    if (!refreshToken && request.headers.cookie) {
      const cookies = request.headers.cookie.split(';');
      const refreshTokenCookie = cookies.find((cookie: string) =>
        cookie.trim().startsWith('refreshToken='),
      );
      if (refreshTokenCookie) {
        refreshToken = refreshTokenCookie.split('=')[1].trim();
      }
    }

    return next.handle().pipe(
      catchError((error) => {
        if (error.status === 401 && refreshToken) {
          console.log('Attempting to refresh token with:', refreshToken);
          return new Observable((subscriber) => {
            handleRequest(() =>
              this.authService.refreshToken({ refreshToken }, new Metadata()),
            )
              .then((response) => {
                console.log('Token refresh successful');
                // Обновляем access token в заголовке
                request.headers.authorization = `Bearer ${response.accessToken}`;
                // Обновляем refresh token в куках
                request.res.cookie('refreshToken', response.refreshToken, {
                  httpOnly: true,
                  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
                });
                // Повторяем оригинальный запрос с новым токеном
                next.handle().subscribe({
                  next: (value) => subscriber.next(value),
                  error: (err) => subscriber.error(err),
                  complete: () => subscriber.complete(),
                });
              })
              .catch((refreshError) => {
                console.error('Token refresh failed:', refreshError);
                subscriber.error(refreshError);
              });
          });
        }
        return throwError(() => error);
      }),
    );
  }
}
