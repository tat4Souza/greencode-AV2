import type { Prisma } from "../generated/prisma/client.js";
import type { Role } from "../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";
import type {
  CreateUserInput,
  UpdateUserInput,
} from "../schemas/user.schema.js";

const publicUserSelect = {
  id: true,
  email: true,
  username: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  version: true,
  createdBy: { select: { id: true, username: true } },
  active: true,
} satisfies Prisma.UserSelect;

export function createUser(
  data: Omit<CreateUserInput, "password"> & {
    passwordHash: string;
    createdById?: string;
  },
) {
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

export function findUsers(filters: { role?: Role; active: boolean }) {
  return prisma.user.findMany({
    where: filters,
    select: publicUserSelect,
  });
}

export function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: publicUserSelect,
  });
}

export async function updateUser(
  id: string,
  version: number,
  data: Omit<UpdateUserInput, "password" | "version"> & {
    passwordHash?: string;
  },
) {
  const result = await prisma.user.updateMany({
    where: { id, version },
    data: { ...data, version: { increment: 1 } },
  });
  return result.count;
}

export function deleteUser(id: string) {
  return prisma.user.delete({
    where: { id },
    select: publicUserSelect,
  });
}

export async function updateUserActiveStatus(
  id: string,
  version: number,
  value: boolean,
) {
  const result = await prisma.user.updateMany({
    where: { id, version, active: true },
    data: { active: value, version: { increment: 1 } },
  });
  return result.count;
}

export function countActiveAdmins() {
  return prisma.user.count({ where: { role: "ADMIN", active: true } });
}

export function findUserAuthState(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { active: true, tokenVersion: true },
  });
}

export function findUserWithPasswordById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export function bumpTokenVersion(id: string) {
  return prisma.user.update({
    where: { id },
    data: { tokenVersion: { increment: 1 } },
    select: { id: true },
  });
}

export function updateUserPassword(id: string, passwordHash: string) {
  return prisma.user.update({
    where: { id },
    data: { passwordHash, tokenVersion: { increment: 1 } },
    select: { id: true },
  });
}
