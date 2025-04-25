import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GrpcExceptionFilter } from './grpc/grpc-exception.filter';
import { LoggerService } from './logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule, {
    bufferLogs: true,
  });

  // Set up the logger
  const logger = await app.resolve(LoggerService);
  app.useLogger(logger);

  // app.connectMicroservice<MicroserviceOptions>(grpcClientOptions);

  // await app.startAllMicroservices();

  const config = new ConfigService();
  const port = config.get<number>('PORT') ?? 3000;

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new GrpcExceptionFilter());
  app.enableCors();
  app.setGlobalPrefix('api');

  const configSwagger = new DocumentBuilder()
    .setTitle('Диплом Дмитрий Соболев')
    .setDescription('Документаци по API GATEWAY')
    .setVersion('0.0.1')
    .addSecurityRequirements('JWT-auth')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .addTag('Dmitriy Sobolev')
    .build();
  const document = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('/api-docs', app, document);

  await app.listen(port);
  logger.warn(`Server started on port ${await app.getUrl()}`);
}
bootstrap();
