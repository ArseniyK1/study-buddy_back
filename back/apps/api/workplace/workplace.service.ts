import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { workplacesStatus } from '@shared/types/workplaces-status.enum';
import { bookingStatus } from '@shared/types/booking-status.enum';

@Injectable()
export class WorkplaceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePlaceDto) {
    if (dto.zoneId) {
      const zone = await this.prisma.workspaceZone.findUnique({
        where: { id: dto.zoneId },
      });

      if (!zone) {
        throw new NotFoundException(`Зона с ID ${dto.zoneId} не найдена`);
      }
    }

    return this.prisma.place.create({
      data: {
        name: dto.name,
        description: dto.description,
        status: workplacesStatus.AVAILABLE,
        zoneId: dto.zoneId,
      },
    });
  }

  async findAll(zoneId: number) {
    return this.prisma.place.findMany({
      where: {
        zoneId,
      },
      include: {
        zone: true,
      },
      orderBy: {
        id: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const place = await this.prisma.place.findUnique({
      where: { id },
      include: {
        zone: true,
        bookings: true,
      },
    });

    if (!place) {
      throw new NotFoundException(`Place with ID ${id} not found`);
    }

    return place;
  }

  async update(id: number, updatePlaceDto: UpdatePlaceDto) {
    const place = await this.prisma.place.findUnique({
      where: { id },
    });

    if (!place) {
      throw new NotFoundException(`Place with ID ${id} not found`);
    }

    if (updatePlaceDto.zoneId) {
      const zone = await this.prisma.workspaceZone.findUnique({
        where: { id: updatePlaceDto.zoneId },
      });

      if (!zone) {
        throw new NotFoundException(
          `Zone with ID ${updatePlaceDto.zoneId} not found`,
        );
      }
    }

    return this.prisma.place.update({
      where: { id },
      data: updatePlaceDto,
    });
  }

  async remove(id: number) {
    const place = await this.prisma.place.findUnique({
      where: { id },
    });

    if (!place) {
      throw new NotFoundException(`Place with ID ${id} not found`);
    }

    return this.prisma.place.delete({
      where: { id },
    });
  }

  async createBooking(userId: number, dto: CreateBookingDto) {
    const place = await this.prisma.place.findUnique({
      where: { id: dto.placeId },
    });

    if (!place?.id) {
      throw new NotFoundException(
        `Рабочее место с ID ${dto.placeId} не найдено`,
      );
    }

    const existingBookings = await this.prisma.booking.findMany({
      where: {
        placeId: dto.placeId,
        OR: [
          {
            // Сценарий 1: Существующая бронь началась раньше и все еще активна
            AND: [
              { startTime: { lte: dto.startTime } },
              { endTime: { gt: dto.startTime } },
            ],
          },
          {
            // Сценарий 2: Существующая бронь началась во время новой и продолжается после
            AND: [
              { startTime: { lt: dto.endTime } },
              { endTime: { gte: dto.endTime } },
            ],
          },
          {
            // Сценарий 3: Существующая бронь полностью внутри новой
            AND: [
              { startTime: { gte: dto.startTime } },
              { endTime: { lte: dto.endTime } },
            ],
          },
        ],
      },
    });

    if (existingBookings?.length > 0) {
      throw new BadRequestException(
        'Это место уже забронировано для указанного периода',
      );
    }

    let totalPrice = 0;
    if (place.zoneId) {
      const zone = await this.prisma.workspaceZone.findUnique({
        where: { id: place.zoneId },
      });

      if (zone) {
        const hours =
          (new Date(dto.endTime).getTime() -
            new Date(dto.startTime).getTime()) /
          (1000 * 60 * 60);
        totalPrice = zone.pricePerHour * hours;
      }
    }

    return this.prisma.booking.create({
      data: {
        startTime: dto.startTime,
        endTime: dto.endTime,
        status: bookingStatus.ACTIVE,
        totalPrice,
        userId,
        placeId: dto.placeId,
      },
    });
  }

  async getPlaceBookings(placeId: number) {
    const place = await this.prisma.place.findUnique({
      where: { id: placeId },
    });

    if (!place) {
      throw new NotFoundException(`Рабочее место с ID ${placeId} не найдено`);
    }

    return this.prisma.booking.findMany({
      where: { placeId },
      include: {
        user: true,
      },
    });
  }
}
