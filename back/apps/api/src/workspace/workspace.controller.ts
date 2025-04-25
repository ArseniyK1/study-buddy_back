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
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { ApproveWorkspaceDto } from './dto/approve-workspace.dto';
import { AddManagerDto } from './dto/add-manager.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { IRequest } from '@shared/types/IRequest.interface';
import { Role } from '@shared/types/roles.enum';
import { Roles } from '../auth/guard/roles.decorator';

@ApiTags('Коворкинг пространства')
@Controller('workspaces')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Roles(Role.MANAGER)
  @Post()
  @ApiOperation({ summary: 'Создать новое коворкинг пространство' })
  @ApiResponse({
    status: 201,
    description: 'Коворкинг пространство успешно создано.',
  })
  @ApiResponse({ status: 400, description: 'Неверный запрос.' })
  create(
    @Request() req: IRequest,
    @Body() createWorkspaceDto: CreateWorkspaceDto,
  ) {
    return this.workspaceService.create(req.user.userId, createWorkspaceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все коворкинг пространства' })
  @ApiResponse({
    status: 200,
    description: 'Возвращает все коворкинг пространства.',
  })
  findAll() {
    return this.workspaceService.findAll();
  }

  @Get('approved')
  @ApiOperation({ summary: 'Получить все одобренные коворкинг пространства' })
  @ApiResponse({
    status: 200,
    description: 'Возвращает все одобренные коворкинг пространства.',
  })
  findApproved() {
    return this.workspaceService.findApproved();
  }

  @Get('pending')
  @ApiOperation({
    summary: 'Получить все коворкинг пространства, ожидающие одобрения',
  })
  @ApiResponse({
    status: 200,
    description: 'Возвращает все коворкинг пространства, ожидающие одобрения.',
  })
  findPendingApproval() {
    return this.workspaceService.findPendingApproval();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить коворкинг пространство по ID' })
  @ApiParam({ name: 'id', description: 'ID коворкинг пространства' })
  @ApiResponse({
    status: 200,
    description: 'Возвращает коворкинг пространство.',
  })
  @ApiResponse({
    status: 404,
    description: 'Коворкинг пространство не найдено.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.workspaceService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить коворкинг пространство' })
  @ApiParam({ name: 'id', description: 'ID коворкинг пространства' })
  @ApiResponse({
    status: 200,
    description: 'Коворкинг пространство успешно обновлено.',
  })
  @ApiResponse({
    status: 404,
    description: 'Коворкинг пространство не найдено.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
  ) {
    return this.workspaceService.update(id, updateWorkspaceDto);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Одобрить или отклонить рабочее пространство' })
  @ApiParam({ name: 'id', description: 'ID рабочего пространства' })
  @ApiResponse({
    status: 200,
    description: 'Коворкинг пространство успешно одобрено/отклонено.',
  })
  @ApiResponse({
    status: 404,
    description: 'Коворкинг пространство не найдено.',
  })
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() approveWorkspaceDto: ApproveWorkspaceDto,
  ) {
    return this.workspaceService.approve(id, approveWorkspaceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить рабочее пространство' })
  @ApiParam({ name: 'id', description: 'ID рабочего пространства' })
  @ApiResponse({
    status: 200,
    description: 'Рабочее пространство успешно удалено.',
  })
  @ApiResponse({ status: 404, description: 'Рабочее пространство не найдено.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.workspaceService.remove(id);
  }

  @Post(':id/managers')
  @ApiOperation({ summary: 'Добавить менеджера в коворкинг пространство' })
  @ApiParam({ name: 'id', description: 'ID коворкинг пространства' })
  @ApiResponse({
    status: 201,
    description: 'Менеджер успешно добавлен в коворкинг пространство.',
  })
  @ApiResponse({
    status: 404,
    description: 'Коворкинг пространство или пользователь не найдены.',
  })
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
  @ApiResponse({
    status: 200,
    description: 'Менеджер успешно удален из коворкинг пространства.',
  })
  @ApiResponse({
    status: 404,
    description: 'Коворкинг пространство или менеджер не найдены.',
  })
  removeManager(
    @Param('id', ParseIntPipe) id: number,
    @Param('managerId', ParseIntPipe) managerId: number,
  ) {
    return this.workspaceService.removeManager(id, managerId);
  }
}
