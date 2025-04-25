import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkspaceZoneDto } from './create-workspace-zone.dto';

export class UpdateWorkspaceZoneDto extends PartialType(
  CreateWorkspaceZoneDto,
) {}
