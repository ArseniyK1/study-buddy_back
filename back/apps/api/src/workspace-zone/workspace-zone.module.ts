import { Module } from '@nestjs/common';
import { WorkspaceZoneController } from './workspace-zone.controller';
import { WorkspaceZoneService } from './workspace-zone.service';
import { PrismaModule } from '../../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WorkspaceZoneController],
  providers: [WorkspaceZoneService],
  exports: [WorkspaceZoneService],
})
export class WorkspaceZoneModule {}
