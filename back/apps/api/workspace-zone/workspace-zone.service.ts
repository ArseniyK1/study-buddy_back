import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateWorkspaceZoneDto } from './dto/create-workspace-zone.dto';
import { UpdateWorkspaceZoneDto } from './dto/update-workspace-zone.dto';

@Injectable()
export class WorkspaceZoneService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createWorkspaceZoneDto: CreateWorkspaceZoneDto) {
    return this.prisma.workspaceZone.create({
      data: {
        name: createWorkspaceZoneDto.name,
        description: createWorkspaceZoneDto.description,
        pricePerHour: createWorkspaceZoneDto.pricePerHour,
        maxPlaces: createWorkspaceZoneDto.maxPlaces,
        workspaceId: createWorkspaceZoneDto.workspaceId,
      },
      include: {
        workspace: true,
        places: true,
      },
    });
  }

  async findAll(workspaceId: number) {
    if (!workspaceId) {
      throw new BadRequestException('Необходимо указать ID коворкинга');
    }
    return this.prisma.workspaceZone.findMany({
      where: {
        workspaceId,
      },
      include: {
        workspace: true,
        places: true,
      },
    });
  }

  async findOne(id: number) {
    const workspaceZone = await this.prisma.workspaceZone.findUnique({
      where: { id },
      include: {
        workspace: true,
        places: true,
      },
    });

    if (!workspaceZone) {
      throw new NotFoundException(`Workspace zone with ID ${id} not found`);
    }

    return workspaceZone;
  }

  async update(id: number, updateWorkspaceZoneDto: UpdateWorkspaceZoneDto) {
    try {
      return await this.prisma.workspaceZone.update({
        where: { id },
        data: updateWorkspaceZoneDto,
        include: {
          workspace: true,
          places: true,
        },
      });
    } catch (error) {
      throw new NotFoundException(`Workspace zone with ID ${id} not found`);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.workspaceZone.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Workspace zone with ID ${id} not found`);
    }
  }
}
