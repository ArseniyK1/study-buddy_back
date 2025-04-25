import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { ApproveWorkspaceDto } from './dto/approve-workspace.dto';

@Injectable()
export class WorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, createWorkspaceDto: CreateWorkspaceDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: +userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.prisma.workspace.create({
      data: {
        name: createWorkspaceDto.name,
        address: createWorkspaceDto.address,
        description: createWorkspaceDto.description,
        capacity: createWorkspaceDto.capacity,
        amenities: createWorkspaceDto.amenities,
        ownerId: user.id,
        approved: false, // New workspaces are not approved by default
      },
      include: {
        owner: true,
        zones: true,
      },
    });
  }

  async findAll() {
    return this.prisma.workspace.findMany({
      include: {
        owner: true,
        zones: true,
      },
    });
  }

  async findApproved() {
    return this.prisma.workspace.findMany({
      where: {
        approved: true,
      },
      include: {
        owner: true,
        zones: true,
      },
    });
  }

  async findPendingApproval() {
    return this.prisma.workspace.findMany({
      where: {
        approved: false,
      },
      include: {
        owner: true,
        zones: true,
      },
    });
  }

  async findOne(id: number) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
      include: {
        owner: true,
        zones: true,
      },
    });

    if (!workspace) {
      throw new NotFoundException(`Workspace with ID ${id} not found`);
    }

    return workspace;
  }

  async update(id: number, updateWorkspaceDto: UpdateWorkspaceDto) {
    try {
      return await this.prisma.workspace.update({
        where: { id },
        data: updateWorkspaceDto,
        include: {
          owner: true,
          zones: true,
        },
      });
    } catch (error) {
      throw new NotFoundException(`Workspace with ID ${id} not found`);
    }
  }

  async approve(id: number, approveWorkspaceDto: ApproveWorkspaceDto) {
    try {
      return await this.prisma.workspace.update({
        where: { id },
        data: {
          approved: approveWorkspaceDto.approved,
        },
        include: {
          owner: true,
          zones: true,
        },
      });
    } catch (error) {
      throw new NotFoundException(`Workspace with ID ${id} not found`);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.workspace.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Workspace with ID ${id} not found`);
    }
  }

  async addManager(workspaceId: number, managerId: number) {
    // Проверяем существование рабочего пространства
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException(
        `Рабочее пространство с ID ${workspaceId} не найдено`,
      );
    }

    // Проверяем существование пользователя
    const user = await this.prisma.user.findUnique({
      where: { id: managerId },
    });

    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${managerId} не найден`);
    }

    try {
      // Добавляем менеджера в рабочее пространство
      return await this.prisma.workspaceManager.create({
        data: {
          workspaceId,
          managerId,
        },
        include: {
          workspace: true,
          manager: true,
        },
      });
    } catch (error) {
      // Если менеджер уже существует, выбрасываем исключение
      if (error.code === 'P2002') {
        throw new ConflictException(
          `Пользователь с ID ${managerId} уже является менеджером этого рабочего пространства`,
        );
      }
      throw error;
    }
  }

  async removeManager(workspaceId: number, managerId: number) {
    // Проверяем существование рабочего пространства
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException(
        `Рабочее пространство с ID ${workspaceId} не найдено`,
      );
    }

    // Проверяем существование менеджера
    const manager = await this.prisma.workspaceManager.findUnique({
      where: {
        workspaceId_managerId: {
          workspaceId,
          managerId,
        },
      },
    });

    if (!manager) {
      throw new NotFoundException(
        `Менеджер с ID ${managerId} не найден в рабочем пространстве с ID ${workspaceId}`,
      );
    }

    // Удаляем менеджера из рабочего пространства
    // Благодаря middleware для мягкого удаления, запись не будет физически удалена,
    // а только помечена как удаленная (установлено поле deletedAt)
    return await this.prisma.workspaceManager.delete({
      where: {
        workspaceId_managerId: {
          workspaceId,
          managerId,
        },
      },
    });
  }
}
