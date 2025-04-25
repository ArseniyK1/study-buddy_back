import { Status } from '@grpc/grpc-js/build/src/constants';
import { RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom, lastValueFrom, Observable } from 'rxjs';

export async function handleRequest<T>(
  request: () => Observable<T>,
): Promise<T> {
  try {
    return await lastValueFrom(
      request().pipe(
        catchError((error) => {
          throw new RpcException({
            code: error.code || Status.INTERNAL,
            message: error.message || 'Internal server error',
          });
        }),
      ),
    );
  } catch (error) {
    throw error;
  }
}
