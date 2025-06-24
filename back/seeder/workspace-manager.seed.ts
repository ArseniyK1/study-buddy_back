import { PrismaClient, WorkspaceManager } from '@prisma/client';
import { fakerRU as faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

export const createWorkspaceManagers = async (
  quantity: number,
  workspaceIds: number[],
  managerIds: number[],
) => {
  const workspaceManagers: WorkspaceManager[] = [];

  for (let i = 0; i < quantity; i++) {
    if (workspaceIds[i] && managerIds[i]) {
      const wm = await prisma.workspaceManager.create({
        data: {
          workspaceId: workspaceIds[i],
          managerId: managerIds[i],
        },
      });
      workspaceManagers.push(wm);
    }
  }

  return workspaceManagers;
};
