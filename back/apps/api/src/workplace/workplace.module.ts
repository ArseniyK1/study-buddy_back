import { Module } from '@nestjs/common';
import { WorkplaceController } from './workplace.controller';
import { WorkplaceService } from './workplace.service';
import { PrismaService } from '../prisma/prisma.service';
@Module({
  controllers: [WorkplaceController],
  providers: [WorkplaceService, PrismaService],
  exports: [WorkplaceService],
})
export class WorkplaceModule {}
