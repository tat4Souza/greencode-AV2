import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import type { CreateUserInput } from "../schemas/user.schema.js";

export async function createUser(input: CreateUserInput) {
  const { password, ...rest } = input;
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { ...rest, passwordHash },
  });

  return user;
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}
