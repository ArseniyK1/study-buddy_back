import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GrpcExceptionFilter } from './common/grpc/grpc-exception.filter';
import { LoggerService } from './common/logger/logger.service';

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
  const options = {
    customCss: `
      .topbar-wrapper img {content:url('../assets/img/lbglogo.png'); width:300px; height:auto;}
      .swagger-ui .topbar { background-color: #1b1b1b; }
      .swagger-ui { background-color: #1b1b1b; color: #ffffff; }
      .swagger-ui .info .title { color: #ffffff; }
      .swagger-ui .info .description { color: #ffffff; }
      .swagger-ui .info li, .swagger-ui .info p, .swagger-ui .info table { color: #ffffff; }
      .swagger-ui .scheme-container { background-color: #1b1b1b; }
      .swagger-ui .opblock .opblock-summary-operation-id, .swagger-ui .opblock .opblock-summary-path, .swagger-ui .opblock .opblock-summary-description { color: #ffffff; }
      .swagger-ui .opblock { background-color: #2b2b2b; border-color: #404040; }
      .swagger-ui .opblock .opblock-section-header { background-color: #2b2b2b; }
      .swagger-ui .opblock-tag { color: #ffffff; }
      .swagger-ui .opblock .opblock-section-header h4 { color: #ffffff; }
      .swagger-ui .response-col_status { color: #ffffff; }
      .swagger-ui .response-col_description { color: #ffffff; }
      .swagger-ui .parameter__name { color: #ffffff; }
      .swagger-ui .parameter__type { color: #ffffff; }
      .swagger-ui .parameter__deprecated { color: #ffffff; }
      .swagger-ui .parameter__in { color: #ffffff; }
      .swagger-ui table thead tr td, .swagger-ui table thead tr th { color: #ffffff; }
      .swagger-ui .responses-table td { color: #ffffff; }
    `,
  };
  SwaggerModule.setup('/api-docs', app, document, options);

  await app.listen(port);
  logger.warn(`Server started on port ${await app.getUrl()}`);
}
bootstrap();
