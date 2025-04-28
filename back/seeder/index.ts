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

  // Создание ролей
  await createRoles();
  console.log('Roles created successfully');

  // Создание пользователей с ID ролей
  const users = await createUsers(100);
  console.log('Пользователи созданы успешно');

  // Извлечение ID пользователей для создания коворкинга
  const ownerIds = users
    .map((user) => {
      if (user.roleId === 2) {
        return user.id;
      }
    })
    .filter((id): id is number => id !== undefined);

  // Создание коворкингов с ID пользователей
  const workspaces = await createWorkspaces(50, ownerIds);
  console.log('Коворкинги созданы успешно');

  // Извлечение ID коворкингов для создания зон
  const workspaceIds = workspaces.map((workspace) => workspace.id);

  // Создание зон коворкингов с ID коворкингов
  const workspaceZones = await createWorkspaceZones(100, workspaceIds);
  console.log('Зоны коворкингов созданы успешно');

  // Извлечение ID зон для создания рабочих мест
  const zoneIds = workspaceZones.map((zone) => zone.id);

  // Создание рабочих мест с ID зон
  const places = await createPlaces(200, zoneIds);
  console.log('Рабочие места созданы успешно');

  // Извлечение ID рабочих мест для создания бронирований
  const placeIds = places.map((place) => place.id);

  const clientIds = users
    .map((user) => {
      if (user.roleId === 1) {
        return user.id;
      }
    })
    .filter((id): id is number => id !== undefined);

  // Создание бронирований с ID пользователей и ID рабочих мест
  await createBookings(300, clientIds, placeIds);
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
