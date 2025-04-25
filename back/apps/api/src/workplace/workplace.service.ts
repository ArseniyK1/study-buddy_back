import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class WorkplaceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPlaceDto: CreatePlaceDto) {
    if (createPlaceDto.zoneId) {
      const zone = await this.prisma.workspaceZone.findUnique({
        where: { id: createPlaceDto.zoneId },
      });

      if (!zone) {
        throw new NotFoundException(
          `Zone with ID ${createPlaceDto.zoneId} not found`,
        );
      }
    }

    return this.prisma.place.create({
      data: {
        name: createPlaceDto.name,
        description: createPlaceDto.description,
        status: createPlaceDto.status,
        zoneId: createPlaceDto.zoneId,
      },
    });
  }

  // Get all places
  async findAll() {
    return this.prisma.place.findMany({
      include: {
        zone: true,
      },
    });
  }

  // Get a place by ID
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

  // Update a place
  async update(id: number, updatePlaceDto: UpdatePlaceDto) {
    // Check if the place exists
    const place = await this.prisma.place.findUnique({
      where: { id },
    });

    if (!place) {
      throw new NotFoundException(`Place with ID ${id} not found`);
    }

    // If zoneId is provided, check if the zone exists
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

  // Remove a place
  async remove(id: number) {
    // Check if the place exists
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

  // Create a booking for a place
  async createBooking(createBookingDto: CreateBookingDto) {
    // Check if the place exists
    const place = await this.prisma.place.findUnique({
      where: { id: createBookingDto.placeId },
    });

    if (!place) {
      throw new NotFoundException(
        `Place with ID ${createBookingDto.placeId} not found`,
      );
    }

    // Check if the user exists
    const user = await this.prisma.user.findUnique({
      where: { id: createBookingDto.userId },
    });

    if (!user) {
      throw new NotFoundException(
        `User with ID ${createBookingDto.userId} not found`,
      );
    }

    // Check if the place is available for the requested time period
    const existingBookings = await this.prisma.booking.findMany({
      where: {
        placeId: createBookingDto.placeId,
        OR: [
          {
            AND: [
              { startTime: { lte: createBookingDto.startTime } },
              { endTime: { gt: createBookingDto.startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: createBookingDto.endTime } },
              { endTime: { gte: createBookingDto.endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: createBookingDto.startTime } },
              { endTime: { lte: createBookingDto.endTime } },
            ],
          },
        ],
      },
    });

    if (existingBookings.length > 0) {
      throw new BadRequestException(
        'The place is already booked for the requested time period',
      );
    }

    // Calculate total price based on the zone's price per hour
    let totalPrice = 0;
    if (place.zoneId) {
      const zone = await this.prisma.workspaceZone.findUnique({
        where: { id: place.zoneId },
      });

      if (zone) {
        const hours =
          (createBookingDto.endTime.getTime() -
            createBookingDto.startTime.getTime()) /
          (1000 * 60 * 60);
        totalPrice = zone.pricePerHour * hours;
      }
    }

    return this.prisma.booking.create({
      data: {
        startTime: createBookingDto.startTime,
        endTime: createBookingDto.endTime,
        status: 'ACTIVE',
        totalPrice,
        userId: createBookingDto.userId,
        placeId: createBookingDto.placeId,
      },
    });
  }

  // Get all bookings for a place
  async getPlaceBookings(placeId: number) {
    // Check if the place exists
    const place = await this.prisma.place.findUnique({
      where: { id: placeId },
    });

    if (!place) {
      throw new NotFoundException(`Place with ID ${placeId} not found`);
    }

    return this.prisma.booking.findMany({
      where: { placeId },
      include: {
        user: true,
      },
    });
  }
}
