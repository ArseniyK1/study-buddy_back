import { PrismaClient, Booking } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

export const createBookings = async (
  quantity: number,
  userIds: number[],
  placeIds: number[],
) => {
  const bookings: Booking[] = [];
  const statuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];

  for (let i = 0; i < quantity; i++) {
    const startTime = faker.date.future();
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + faker.number.int({ min: 1, max: 8 }));

    const booking = await prisma.booking.create({
      data: {
        startTime,
        endTime,
        status: statuses[faker.number.int({ min: 0, max: 3 })],
        totalPrice: parseFloat(faker.commerce.price({ min: 10, max: 500 })),
        userId: userIds[faker.number.int({ min: 0, max: userIds.length - 1 })],
        placeId:
          placeIds[faker.number.int({ min: 0, max: placeIds.length - 1 })],
      },
    });

    bookings.push(booking);
  }

  console.log(`Created ${bookings.length} bookings`);
  return bookings;
};
