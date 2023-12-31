import type { Password, User } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";

import { UpdatableUserError, createUserJSONErrorResponse, isFieldValueIsAvailable } from "./user.utils.server";

export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User["email"]) {
  if (!email) {
    return null;
  }
  return prisma.user.findFirst({ where: { email } });
}

export async function createEmailUser(email: User["email"], password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  if (!email || !hashedPassword) {
    throw new Response(
      "Cannot create email user if email and password are missing",
      { status: 400 }
    );
  }

  const maybeExistingUser = await getUserByEmail(email);
  if (maybeExistingUser) {
    throw new Response("User already exists", { status: 400 });
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
  if (!email) {
    throw new Response("Cannot delete user by email if email is missing", { status: 400 });
  }
  return prisma.user.deleteMany({ where: { email } });
}

export async function deleteUserByUsername(username: User["username"]) {
  return prisma.user.delete({ where: { username } });
}

export async function verifyLogin(
  email: User["email"],
  password: Password["encryptedPassword"],
) {
  if (!email || !password) {
    return null;
  }
  const userWithPassword = await prisma.user.findFirst({
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

export async function updateUser(user: Partial<User> & { id: User["id"] }, requestingUserId: User["id"]
): Promise<Pick<User, "id"> | UpdatableUserError> {
  const { id, ...data } = user
  if (id !== requestingUserId) {
    throw new Response("You are not authorized to edit this user", { status: 401 });
  }

  const { email, phoneNumber, username } = data;
  if (email && !(await isFieldValueIsAvailable("email", email, id))) {
    return createUserJSONErrorResponse("email", "Email is already taken")
  }
  if (phoneNumber && !(await isFieldValueIsAvailable("phoneNumber", phoneNumber, id))) {
    return createUserJSONErrorResponse("phoneNumber", "Phone number is already taken")

  }
  if (username && !(await isFieldValueIsAvailable("username", username, id))) {
    return createUserJSONErrorResponse("username", "Username is already taken")
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data,
  });
  return { id: updatedUser.id };
}