import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { LoggerModule } from '@app/api/common/logger/logger.module';

@Global()
@Module({
  imports: [LoggerModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
