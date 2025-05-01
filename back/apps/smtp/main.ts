import { NestFactory } from '@nestjs/core';
import { SmtpModule } from './smtp.module';
import { MicroserviceOptions } from '@nestjs/microservices';
import { join } from 'path';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    SmtpModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'smtp',
        protoPath: join(__dirname, '../../../shared/proto/smtp.proto'),
      },
    },
  );
  await app.listen();
}
bootstrap().catch((err) => {
  console.error(err);
});
