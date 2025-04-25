import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { ApproveWorkspaceDto } from './dto/approve-workspace.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Workspaces')
@Controller('workspaces')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workspace' })
  @ApiResponse({
    status: 201,
    description: 'The workspace has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(@Body() createWorkspaceDto: CreateWorkspaceDto) {
    return this.workspaceService.create(createWorkspaceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all workspaces' })
  @ApiResponse({ status: 200, description: 'Return all workspaces.' })
  findAll() {
    return this.workspaceService.findAll();
  }

  @Get('approved')
  @ApiOperation({ summary: 'Get all approved workspaces' })
  @ApiResponse({ status: 200, description: 'Return all approved workspaces.' })
  findApproved() {
    return this.workspaceService.findApproved();
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get all pending workspaces' })
  @ApiResponse({ status: 200, description: 'Return all pending workspaces.' })
  findPendingApproval() {
    return this.workspaceService.findPendingApproval();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a workspace by id' })
  @ApiParam({ name: 'id', description: 'Workspace ID' })
  @ApiResponse({ status: 200, description: 'Return the workspace.' })
  @ApiResponse({ status: 404, description: 'Workspace not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.workspaceService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a workspace' })
  @ApiParam({ name: 'id', description: 'Workspace ID' })
  @ApiResponse({
    status: 200,
    description: 'The workspace has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Workspace not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
  ) {
    return this.workspaceService.update(id, updateWorkspaceDto);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve or reject a workspace' })
  @ApiParam({ name: 'id', description: 'Workspace ID' })
  @ApiResponse({
    status: 200,
    description: 'The workspace has been successfully approved/rejected.',
  })
  @ApiResponse({ status: 404, description: 'Workspace not found.' })
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() approveWorkspaceDto: ApproveWorkspaceDto,
  ) {
    return this.workspaceService.approve(id, approveWorkspaceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a workspace' })
  @ApiParam({ name: 'id', description: 'Workspace ID' })
  @ApiResponse({
    status: 200,
    description: 'The workspace has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Workspace not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.workspaceService.remove(id);
  }
}
