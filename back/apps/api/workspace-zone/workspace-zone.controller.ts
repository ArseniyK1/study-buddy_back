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
import { WorkspaceZoneService } from './workspace-zone.service';
import { CreateWorkspaceZoneDto } from './dto/create-workspace-zone.dto';
import { UpdateWorkspaceZoneDto } from './dto/update-workspace-zone.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Workspace Zones')
@Controller('workspace-zones')
export class WorkspaceZoneController {
  constructor(private readonly workspaceZoneService: WorkspaceZoneService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workspace zone' })
  @ApiResponse({
    status: 201,
    description: 'The workspace zone has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(@Body() createWorkspaceZoneDto: CreateWorkspaceZoneDto) {
    return this.workspaceZoneService.create(createWorkspaceZoneDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all workspace zones' })
  @ApiResponse({ status: 200, description: 'Return all workspace zones.' })
  findAll() {
    return this.workspaceZoneService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a workspace zone by id' })
  @ApiParam({ name: 'id', description: 'Workspace Zone ID' })
  @ApiResponse({ status: 200, description: 'Return the workspace zone.' })
  @ApiResponse({ status: 404, description: 'Workspace zone not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.workspaceZoneService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a workspace zone' })
  @ApiParam({ name: 'id', description: 'Workspace Zone ID' })
  @ApiResponse({
    status: 200,
    description: 'The workspace zone has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Workspace zone not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWorkspaceZoneDto: UpdateWorkspaceZoneDto,
  ) {
    return this.workspaceZoneService.update(id, updateWorkspaceZoneDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a workspace zone' })
  @ApiParam({ name: 'id', description: 'Workspace Zone ID' })
  @ApiResponse({
    status: 200,
    description: 'The workspace zone has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Workspace zone not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.workspaceZoneService.remove(id);
  }
}
