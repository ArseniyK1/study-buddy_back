import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { createRoles } from './roles.seed';
import { createUsers } from './users.seed';
import { createWorkspaces } from './workspaces.seed';
import { createWorkspaceZones } from './workspace-zones.seed';
import { createPlaces } from './places.seed';
import { createBookings } from './bookings.seed';

dotenv.config();
const prisma = new PrismaClient();

// Функция для измерения времени выполнения
const measureTime = async (operation: string, fn: () => Promise<any>) => {
  const startTime = Date.now();
  const result = await fn();
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  console.log(`✅ ${operation} выполнено за ${duration.toFixed(2)} секунд`);
  return result;
};

async function main() {
  console.log('Start seeding...');
  const totalStartTime = Date.now();

  console.log('Создание ролей...');
  await measureTime('Создание ролей', createRoles);
  console.log('Роли созданы успешно');

  console.log('Создание пользователей...');
  const users = await measureTime('Создание пользователей', () =>
    createUsers(50),
  );
  // const users = await prisma.user.findMany();
  console.log('Пользователи созданы успешно');

  const ownerIds = users
    .map((user: any) => {
      if (user.roleId === 2) {
        return user.id;
      }
    })
    .filter((id: any): id is number => id !== undefined);

  console.log('Создание коворкингов...');
  await measureTime('Создание коворкингов', () =>
    createWorkspaces(10, ownerIds),
  );
  console.log('Коворкинги созданы успешно');

  const workspaces = await prisma.workspace.findMany();
  const workspaceIds = workspaces.map((workspace) => workspace.id);

  console.log('Создание зон коворкингов...');
  await measureTime('Создание зон коворкингов', () =>
    createWorkspaceZones(100, workspaceIds),
  );
  console.log('Зоны коворкингов созданы успешно');

  const workspaceZones = await prisma.workspaceZone.findMany();
  const zoneIds = workspaceZones.map((zone) => zone.id);

  console.log('Создание рабочих мест...');
  await measureTime('Создание рабочих мест', () => createPlaces(1000, zoneIds));
  console.log('Рабочие места созданы успешно');

  const places = await prisma.place.findMany();
  const placeIds = places.map((place) => place.id);

  const clientIds = users
    .map((user: any) => {
      if (user.roleId === 1) {
        return user.id;
      }
    })
    .filter((id: any): id is number => id !== undefined);

  console.log('Создание бронирований...');
  await measureTime('Создание бронирований', () =>
    createBookings(2000, clientIds, placeIds),
  );
  console.log('Бронирования созданы успешно');

  const totalEndTime = Date.now();
  const totalDuration = (totalEndTime - totalStartTime) / 1000;
  console.log(
    `🎉 Seeding completed successfully in ${totalDuration.toFixed(2)} seconds!`,
  );
}

main()
  .catch((error) => {
    console.error('Error during seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
