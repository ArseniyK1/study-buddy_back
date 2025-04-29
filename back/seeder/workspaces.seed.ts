import { PrismaClient, Workspace } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

export const createWorkspaces = async (quantity: number, userIds: number[]) => {
  const workspaces: Workspace[] = [];

  for (let i = 0; i < quantity; i++) {
    const workspace = await prisma.workspace.create({
      data: {
        name: faker.company.name(),
        address: faker.location.streetAddress(),
        description: faker.lorem.paragraph(),
        capacity: faker.number.int({ min: 10, max: 100 }),
        amenities: faker.lorem.words(5),
        approved: faker.datatype.boolean(),
        ownerId: userIds[faker.number.int({ min: 0, max: userIds.length - 1 })],
      },
    });

    workspaces.push(workspace);
  }

  return workspaces;
};
