import { PrismaClient, User } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { genSalt, hash } from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

export const createUsers = async (quantity: number) => {
  const users: User[] = [];
  const salt = await genSalt(10); // С помощью библиотеки bycrypt создаём соль
  const hashPassword = await hash('test', salt); // bycrypt создаёт хеш пароля

  for (let i = 0; i < quantity; i++) {
    const user = await prisma.user.create({
      data: {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        middleName: faker.person.middleName(),
        password: hashPassword,
        email: faker.internet.email(),
        phone: faker.phone.number(),
        roleId: faker.number.int({ min: 1, max: 4 }),
      },
    });

    users.push(user);
  }

  console.log(`Created ${users.length} users`);
  return users;
};
