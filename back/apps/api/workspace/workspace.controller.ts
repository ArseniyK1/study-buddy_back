import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Request,
  Query,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { ApproveWorkspaceDto } from './dto/approve-workspace.dto';
import { AddManagerDto } from './dto/add-manager.dto';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { IRequest } from '@shared/types/IRequest.interface';
import { Role } from '@shared/types/roles.enum';
import { Roles } from '../auth/guard/roles.decorator';
import { FindWorkspacesDto } from './dto/find-workspaces.dto';

@ApiTags('Коворкинг пространства')
@Controller('workspaces')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  // @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Создать новое коворкинг пространство' })
  create(
    @Request() req: IRequest,
    @Body() createWorkspaceDto: CreateWorkspaceDto,
  ) {
    console.log('req.user.userId', req.user.userId);
    return this.workspaceService.create(+req.user.userId, createWorkspaceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все коворкинг пространства' })
  findAll(@Query() findAllDto: FindWorkspacesDto) {
    return this.workspaceService.findAll(findAllDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить коворкинг пространство по ID' })
  @ApiParam({ name: 'id', description: 'ID коворкинг пространства' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.workspaceService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить коворкинг пространство' })
  @ApiParam({ name: 'id', description: 'ID коворкинг пространства' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
  ) {
    return this.workspaceService.update(id, updateWorkspaceDto);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Одобрить или отклонить рабочее пространство' })
  @ApiParam({ name: 'id', description: 'ID рабочего пространства' })
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() approveWorkspaceDto: ApproveWorkspaceDto,
  ) {
    return this.workspaceService.approve(id, approveWorkspaceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить рабочее пространство' })
  @ApiParam({ name: 'id', description: 'ID рабочего пространства' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.workspaceService.remove(+id);
  }

  @Post(':id/managers')
  @ApiOperation({ summary: 'Добавить менеджера в коворкинг пространство' })
  @ApiParam({ name: 'id', description: 'ID коворкинг пространства' })
  addManager(
    @Param('id', ParseIntPipe) id: number,
    @Body() addManagerDto: AddManagerDto,
  ) {
    return this.workspaceService.addManager(id, addManagerDto.managerId);
  }

  @Delete(':id/managers/:managerId')
  @ApiOperation({ summary: 'Удалить менеджера из коворкинг пространства' })
  @ApiParam({ name: 'id', description: 'ID коворкинг пространства' })
  @ApiParam({ name: 'managerId', description: 'ID менеджера' })
  removeManager(
    @Param('id', ParseIntPipe) id: number,
    @Param('managerId', ParseIntPipe) managerId: number,
  ) {
    return this.workspaceService.removeManager(id, managerId);
  }
}
