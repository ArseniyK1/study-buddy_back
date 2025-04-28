import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApproveWorkspaceDto {
  @ApiProperty({
    description: 'Whether to approve (true) or reject (false) the workspace',
  })
  @IsBoolean()
  approved: boolean;
}
