import { PrismaClient, Booking } from '@prisma/client';
import { fakerRU as faker } from '@faker-js/faker';
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
    // Генерируем случайный день в будущем (до 1 года)
    const baseDate = faker.date.soon({ days: 365 });
    // Час от 1 до 13
    const hour = faker.number.int({ min: 1, max: 13 });
    // Минуты: 0 или 30
    const minute = faker.helpers.arrayElement([0, 30]);
    // Стартовое время
    const startTime = new Date(baseDate);
    startTime.setHours(hour, minute, 0, 0);
    // Длительность бронирования (1-8 часов)
    const durationHours = faker.number.int({ min: 1, max: 8 });
    // Конец бронирования: те же минуты, +N часов
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + durationHours);

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

  return bookings;
};
