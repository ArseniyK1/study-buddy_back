import { PrismaClient, Place } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

export const createPlaces = async (quantity: number, zoneIds: number[]) => {
  const places: Place[] = [];
  const statuses = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'];

  for (let i = 0; i < quantity; i++) {
    const place = await prisma.place.create({
      data: {
        name: faker.commerce.productName(),
        description: faker.lorem.sentence(),
        status: statuses[faker.number.int({ min: 0, max: 2 })],
        zoneId: zoneIds[faker.number.int({ min: 0, max: zoneIds.length - 1 })],
      },
    });

    places.push(place);
  }

  return places;
};
