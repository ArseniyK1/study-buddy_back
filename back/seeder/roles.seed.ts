import { PrismaClient, Role } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

export const createRoles = async () => {
  const roles: Role[] = [];
  const roles_values = [
    {
      value: 'USER',
      description: 'Пользователь',
    },
    {
      value: 'ADMIN',
      description: 'Администратор',
    },
    {
      value: 'MANAGER',
      description: 'Менеджер',
    },
    {
      value: 'SUPER_ADMIN',
      description: 'Супер администратор',
    },
  ];

  for (let i = 0; i < roles_values.length; i++) {
    const role = await prisma.role.create({
      data: {
        value: roles_values[i].value,
        description: roles_values[i].description,
      },
    });

    roles.push(role);
  }

  console.log(`Created ${roles.length} roles`);
  return roles;
};
