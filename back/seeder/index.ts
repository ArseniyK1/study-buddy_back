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

async function main() {
  console.log('Start seeding...');

  console.log('Создание ролей...');
  // await createRoles();
  console.log('Роли созданы успешно');

  console.log('Создание пользователей...');
  // await createUsers(100000);
  console.log('Пользователи созданы успешно');

  const users = await prisma.user.findMany();

  const ownerIds = users
    .map((user) => {
      if (user.roleId === 2) {
        return user.id;
      }
    })
    .filter((id): id is number => id !== undefined);

  console.log('Создание коворкингов...');
  await createWorkspaces(200000, ownerIds);
  console.log('Коворкинги созданы успешно');

  const workspaces = await prisma.workspace.findMany();

  const workspaceIds = workspaces.map((workspace) => workspace.id);

  console.log('Создание зон коворкингов...');
  await createWorkspaceZones(500000, workspaceIds);
  console.log('Зоны коворкингов созданы успешно');

  const workspaceZones = await prisma.workspaceZone.findMany();
  const zoneIds = workspaceZones.map((zone) => zone.id);

  console.log('Создание рабочих мест...');
  await createPlaces(1000000, zoneIds);
  console.log('Рабочие места созданы успешно');

  const places = await prisma.place.findMany();

  const placeIds = places.map((place) => place.id);

  const clientIds = users
    .map((user) => {
      if (user.roleId === 1) {
        return user.id;
      }
    })
    .filter((id): id is number => id !== undefined);

  console.log('Создание бронирований...');
  await createBookings(5000000, clientIds, placeIds);
  console.log('Бронирования созданы успешно');

  console.log('Seeding completed successfully!');
}

main()
  .catch((error) => {
    console.error('Error during seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
