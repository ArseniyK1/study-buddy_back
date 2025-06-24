import { PrismaClient, User } from '@prisma/client';
import { fakerRU as faker } from '@faker-js/faker';
import { genSalt, hash } from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

const generateUniqueEmail = async (baseEmail: string): Promise<string> => {
  let email = baseEmail;
  let counter = 0;

  while (true) {
    try {
      // Проверяем, существует ли пользователь с таким email
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (!existingUser) {
        return email;
      }

      // Если email существует, добавляем случайное число
      const [localPart, domain] = email.split('@');
      email = `${localPart}${faker.number.int({ min: 1000, max: 9999 })}@${domain}`;
      counter++;

      // Защита от бесконечного цикла
      if (counter > 100) {
        throw new Error('Too many attempts to generate unique email');
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Too many attempts to generate unique email'
      ) {
        throw error;
      }
      // Если произошла другая ошибка, пробуем с новым email
      email = faker.internet.email();
    }
  }
};

export const createUsers = async () => {
  const users: User[] = [];
  const salt = await genSalt(10);
  const hashPassword = await hash('test', salt);

  // 2 обычных пользователя
  const user1 = await prisma.user.create({
    data: {
      firstName: 'User',
      lastName: 'One',
      middleName: '',
      password: hashPassword,
      email: 'user@user.com',
      phone: faker.phone.number(),
      roleId: 1, // USER
    },
  });
  users.push(user1);

  const user2 = await prisma.user.create({
    data: {
      firstName: 'User',
      lastName: 'Two',
      middleName: '',
      password: hashPassword,
      email: 'user2@user.com',
      phone: faker.phone.number(),
      roleId: 1, // USER
    },
  });
  users.push(user2);

  // 2 менеджера
  const manager1 = await prisma.user.create({
    data: {
      firstName: 'Manager',
      lastName: 'One',
      middleName: '',
      password: hashPassword,
      email: 'manager@user.com',
      phone: faker.phone.number(),
      roleId: 3, // MANAGER
    },
  });
  users.push(manager1);

  const manager2 = await prisma.user.create({
    data: {
      firstName: 'Manager',
      lastName: 'Two',
      middleName: '',
      password: hashPassword,
      email: 'manager2@user.com',
      phone: faker.phone.number(),
      roleId: 3, // MANAGER
    },
  });
  users.push(manager2);

  // 2 админа
  const admin1 = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'One',
      middleName: '',
      password: hashPassword,
      email: 'admin@user.com',
      phone: faker.phone.number(),
      roleId: 2, // ADMIN
    },
  });
  users.push(admin1);

  const admin2 = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'Two',
      middleName: '',
      password: hashPassword,
      email: 'admin2@user.com',
      phone: faker.phone.number(),
      roleId: 2, // ADMIN
    },
  });
  users.push(admin2);

  return users;
};
