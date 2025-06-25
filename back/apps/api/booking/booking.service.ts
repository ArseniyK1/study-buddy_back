import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { GetMyBookingsDto } from './dto/get-my-bookings.dto';
import { getMyBookings } from '@prisma/client/sql';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async create(createBookingDto: CreateBookingDto) {
    const { startTime, endTime, placeId, userId } = createBookingDto;

    // Check if place exists and is available
    const place = await this.prisma.place.findUnique({
      where: { id: placeId },
      include: { bookings: true },
    });

    if (!place) {
      throw new NotFoundException('Place not found');
    }

    // Check for overlapping bookings
    const overlappingBooking = await this.prisma.booking.findFirst({
      where: {
        placeId,
        status: 'ACTIVE',
        OR: [
          {
            startTime: { lte: endTime },
            endTime: { gte: startTime },
          },
        ],
      },
    });

    if (overlappingBooking) {
      throw new BadRequestException(
        'Place is already booked for this time period',
      );
    }

    // Calculate total price (you can implement your own pricing logic here)
    const hours =
      (new Date(endTime).getTime() - new Date(startTime).getTime()) /
      (1000 * 60 * 60);
    const totalPrice = hours * 100; // Assuming 100 rubles per hour

    return this.prisma.booking.create({
      data: {
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: 'ACTIVE',
        totalPrice,
        userId,
        placeId,
      },
      include: {
        place: {
          include: {
            zone: true,
          },
        },
      },
    });
  }

  async getMyBookings(userId: number, dto: GetMyBookingsDto) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.prisma.$queryRawTyped(
      getMyBookings(
        userId,
        dto.status,
        dto.startDate,
        dto.endDate,
        dto.offset,
        dto.limit,
      ),
    );
    // return this.prisma.booking.findMany({
    //   where: { userId,  },
    //   include: {
    //     place: {
    //       include: {
    //         zone: true,
    //       },
    //     },
    //   },
    //   skip: +dto.offset || 0,
    //   take: +dto.limit || 100,
    // });
  }

  async findOne(id: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        place: {
          include: {
            zone: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async update(id: number, updateBookingDto: UpdateBookingDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return this.prisma.booking.update({
      where: { id },
      data: updateBookingDto,
      include: {
        place: {
          include: {
            zone: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        place: {
          include: {
            zone: true,
          },
        },
      },
    });
  }

  async accept(id: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== 'PENDING') {
      throw new BadRequestException('Only PENDING bookings can be accepted');
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: 'ACTIVE' },
      include: {
        place: {
          include: {
            zone: true,
          },
        },
        user: true,
      },
    });
  }

  async reject(id: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== 'PENDING') {
      throw new BadRequestException('Only PENDING bookings can be rejected');
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        place: {
          include: {
            zone: true,
          },
        },
        user: true,
      },
    });
  }
}
