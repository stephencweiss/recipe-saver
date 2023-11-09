import type { Password, User } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User["email"]) {
  if (!email) { return null };
  return prisma.user.findUnique({ where: { email } });
}

export async function createEmailUser(email: User["email"], password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  if (!email || !hashedPassword) {
    throw new Error("Cannot create email user if email and password are missing");
  }
  return prisma.user.create({
    data: {
      username: email,
      email,
      password: {
        create: {
          encryptedPassword: hashedPassword,
        },
      },
    },
  });
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(
  email: User["email"],
  password: Password["encryptedPassword"],
) {
  if (!email || !password) {
    return null;
  }
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  });

  if (!userWithPassword?.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.encryptedPassword,
  );

  if (!isValid) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}
