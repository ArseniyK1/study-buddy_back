import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { ApproveWorkspaceDto } from './dto/approve-workspace.dto';

@Injectable()
export class WorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createWorkspaceDto: CreateWorkspaceDto) {
    return this.prisma.workspace.create({
      data: {
        name: createWorkspaceDto.name,
        address: createWorkspaceDto.address,
        description: createWorkspaceDto.description,
        capacity: createWorkspaceDto.capacity,
        amenities: createWorkspaceDto.amenities,
        ownerId: createWorkspaceDto.ownerId,
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
}
