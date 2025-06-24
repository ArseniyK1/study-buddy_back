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

export const createUsers = async (quantity: number) => {
  const users: User[] = [];
  const salt = await genSalt(10);
  const hashPassword = await hash('test', salt);

  for (let i = 0; i < quantity; i++) {
    try {
      const baseEmail = faker.internet.email();
      const uniqueEmail = await generateUniqueEmail(baseEmail);

      const user = await prisma.user.create({
        data: {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          middleName: faker.person.middleName(),
          password: hashPassword,
          email: uniqueEmail,
          phone: faker.phone.number(),
          roleId: faker.number.int({ min: 1, max: 4 }),
        },
      });

      users.push(user);
    } catch (error) {
      console.error(`Error creating user ${i + 1}:`, error);
      // Продолжаем с следующим пользователем
      continue;
    }
  }

  return users;
};
