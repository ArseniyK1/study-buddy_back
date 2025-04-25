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

  // Create roles first
  // const roles = await createRoles();
  // console.log('Roles created successfully');

  // Create users with role IDs
  const users = await createUsers(100);
  console.log('Users created successfully');

  // Extract user IDs for workspace creation
  const userIds = users.map((user) => user.id);

  // Create workspaces with user IDs
  const workspaces = await createWorkspaces(50, userIds);
  console.log('Workspaces created successfully');

  // Extract workspace IDs for zone creation
  const workspaceIds = workspaces.map((workspace) => workspace.id);

  // Create workspace zones with workspace IDs
  const workspaceZones = await createWorkspaceZones(100, workspaceIds);
  console.log('Workspace zones created successfully');

  // Extract zone IDs for place creation
  const zoneIds = workspaceZones.map((zone) => zone.id);

  // Create places with zone IDs
  const places = await createPlaces(200, zoneIds);
  console.log('Places created successfully');

  // Extract place IDs for booking creation
  const placeIds = places.map((place) => place.id);

  // Create bookings with user IDs and place IDs
  const bookings = await createBookings(300, userIds, placeIds);
  console.log('Bookings created successfully');

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
