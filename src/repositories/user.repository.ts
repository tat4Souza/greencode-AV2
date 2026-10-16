import type { Role } from "../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";

const publicUserSelect = {
  id: true,
  email: true,
  username: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

export function createUser(data: {
  username: string;
  email: string;
  role?: Role;
  passwordHash: string;
}) {
  return prisma.user.create({
    data,
    select: publicUserSelect,
  });
}

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}

export function findUsers() {
  return prisma.user.findMany({
    select: publicUserSelect,
  });
}

export function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: publicUserSelect,
  });
}

export function updateUser(
  id: string,
  data: {
    username?: string;
    email?: string;
    role?: Role;
    passwordHash?: string;
  },
) {
  return prisma.user.update({ where: { id }, data, select: publicUserSelect });
}

export function deleteUser(id: string) {
  return prisma.user.delete({
    where: { id },
    select: publicUserSelect,
  });
}
