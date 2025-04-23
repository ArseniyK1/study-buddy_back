import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TokenInterceptor } from './interceptors/token.interceptor';

@Module({
  imports: [
    CacheModule.register({
      store: 'redis',
      host: 'localhost',
      port: 6379,
      ttl: 60,
    }),
    ClientsModule.register([
      {
        name: 'GRPC_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'auth',
          protoPath: join(__dirname, '../../../shared/proto/auth.proto'),
          url: 'localhost:5000', // адрес grpc-micro
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: TokenInterceptor,
    // },
  ],
})
export class AuthModule {}
