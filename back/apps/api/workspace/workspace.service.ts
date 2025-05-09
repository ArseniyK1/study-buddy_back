import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { ApproveWorkspaceDto } from './dto/approve-workspace.dto';
import { FindWorkspacesDto } from './dto/find-workspaces.dto';

@Injectable()
export class WorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateWorkspaceDto) {
    return await this.prisma.workspace.create({
      data: {
        name: dto.name,
        address: dto.address,
        description: dto.description,
        capacity: dto.capacity,
        amenities: dto.amenities,
        ownerId: userId,
        approved: false,
      },
      include: {
        owner: true,
      },
    });
  }

  async findAll(dto: FindWorkspacesDto) {
    const queryParams = dto?.query || '';
    const status = dto?.status;

    return this.prisma.workspace.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                name: {
                  contains: queryParams,
                  mode: 'insensitive',
                },
              },
              {
                address: {
                  contains: queryParams,
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  contains: queryParams,
                  mode: 'insensitive',
                },
              },
            ],
          },
          status !== undefined ? { approved: status } : {},
        ],
      },
      include: {
        owner: true,
        managers: true,
      },
      orderBy: {
        id: 'desc',
      },
      skip: +dto?.offset || 0,
      take: +dto?.limit || 100,
    });
  }

  async findOne(id: number) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
      include: {
        owner: true,
        managers: true,
        zones: true,
      },
    });

    if (!workspace) {
      throw new NotFoundException(
        `Коворкинг пространство с ID ${id} не существует`,
      );
    }

    return workspace;
  }

  async update(id: number, dto: UpdateWorkspaceDto) {
    try {
      const workspace = await this.prisma.workspace.update({
        where: { id },
        data: dto,
        include: {
          owner: true,
        },
      });

      if (!workspace?.id) {
        throw new NotFoundException(
          `Коворкинг пространство с ID ${id} не найдено`,
        );
      }

      return workspace;
    } catch (error) {
      throw new InternalServerErrorException(
        `Произошла ошибка при обновлении коворкинг пространства с ID ${id}`,
        { cause: error },
      );
    }
  }

  async approve(id: number, dto: ApproveWorkspaceDto) {
    try {
      const workspace = await this.prisma.workspace.update({
        where: { id },
        data: {
          approved: dto.approved,
        },
        include: {
          owner: true,
        },
      });

      if (!workspace?.id) {
        throw new NotFoundException(
          `Коворкинг пространство с ID ${id} не найдено`,
        );
      }

      return workspace;
    } catch (error) {
      throw new InternalServerErrorException(
        `Произошла ошибка при одобрении коворкинг пространства с ID ${id}`,
        { cause: error },
      );
    }
  }

  async remove(id: number) {
    try {
      const workspace = await this.prisma.workspace.delete({
        where: { id },
      });

      if (!workspace?.id) {
        throw new NotFoundException(
          `Коворкинг пространство с ID ${id} не найдено`,
        );
      }

      return workspace;
    } catch (error) {
      throw new InternalServerErrorException(
        `Произошла ошибка при удалении коворкинг пространства с ID ${id}`,
        { cause: error },
      );
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
