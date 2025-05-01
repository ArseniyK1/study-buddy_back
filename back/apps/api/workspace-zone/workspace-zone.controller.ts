import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { WorkspaceZoneService } from './workspace-zone.service';
import { CreateWorkspaceZoneDto } from './dto/create-workspace-zone.dto';
import { UpdateWorkspaceZoneDto } from './dto/update-workspace-zone.dto';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('Workspace Zones')
@Controller('workspace-zones')
export class WorkspaceZoneController {
  constructor(private readonly workspaceZoneService: WorkspaceZoneService) {}

  @Post()
  @ApiOperation({ summary: 'Создать зону внутри коворкинга' })
  create(@Body() createWorkspaceZoneDto: CreateWorkspaceZoneDto) {
    return this.workspaceZoneService.create(createWorkspaceZoneDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все зоны' })
  findAll(@Query('workspaceId') workspaceId: number) {
    return this.workspaceZoneService.findAll(+workspaceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить зону по id' })
  @ApiParam({ name: 'id', description: 'ID зоны' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.workspaceZoneService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить зону' })
  @ApiParam({ name: 'id', description: 'ID зоны' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWorkspaceZoneDto: UpdateWorkspaceZoneDto,
  ) {
    return this.workspaceZoneService.update(id, updateWorkspaceZoneDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить зону' })
  @ApiParam({ name: 'id', description: 'ID зоны' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.workspaceZoneService.remove(id);
  }
}
