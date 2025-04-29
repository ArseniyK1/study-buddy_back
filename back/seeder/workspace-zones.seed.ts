import { PrismaClient, WorkspaceZone } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

export const createWorkspaceZones = async (
  quantity: number,
  workspaceIds: number[],
) => {
  const workspaceZones: WorkspaceZone[] = [];

  for (let i = 0; i < quantity; i++) {
    const workspaceZone = await prisma.workspaceZone.create({
      data: {
        name: faker.commerce.department(),
        description: faker.lorem.sentence(),
        pricePerHour: parseFloat(faker.commerce.price({ min: 10, max: 100 })),
        maxPlaces: faker.number.int({ min: 5, max: 20 }),
        workspaceId:
          workspaceIds[
            faker.number.int({ min: 0, max: workspaceIds.length - 1 })
          ],
      },
    });

    workspaceZones.push(workspaceZone);
  }

  return workspaceZones;
};
