import { Module } from '@nestjs/common';
import { WorkplaceController } from './workplace.controller';
import { WorkplaceService } from './workplace.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspaceModule } from '../workspace/workspace.module';

@Module({
  imports: [WorkspaceModule],
  controllers: [WorkplaceController],
  providers: [WorkplaceService, PrismaService],
  exports: [WorkplaceService],
})
export class WorkplaceModule {}
