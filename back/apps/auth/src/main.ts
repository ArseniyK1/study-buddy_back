import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { TrpcService } from './trpc/trpc.config';
import { AuthService } from './auth.service';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);

  // Получаем сервисы
  const trpc = app.get(TrpcService);
  const authService = app.get(AuthService);

  // Включаем CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Применяем middleware tRPC с роутером из AuthService
  await trpc.applyMiddleware(app, authService.router);

  // Запускаем сервер на порту 3000
  await app.listen(3000);

  console.log(`🚀 Application is running on: ${await app.getUrl()}`);
}

bootstrap();
