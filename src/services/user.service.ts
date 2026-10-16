import bcrypt from "bcryptjs";
import type {
  CreateUserInput,
  UpdateUserInput,
} from "../schemas/user.schema.js";
import {
  createUser,
  deleteUser,
  findUserByEmail,
  findUserById,
  findUsers,
  updateUser,
} from "../repositories/user.repository.js";
import { conflict, isPrismaError, notFound } from "../lib/errors.js";

export async function registerUser(input: CreateUserInput) {
  const { password, ...rest } = input;
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    return await createUser({ ...rest, passwordHash });
  } catch (e) {
    if (isPrismaError(e, "P2002")) {
      throw conflict("Email já cadastrado");
    }
    throw e;
  }
}

export async function getUsers() {
  return findUsers();
}

export async function getUserById(id: string) {
  const user = await findUserById(id);

  if (!user) throw notFound("Usuário");

  return user;
}

export async function updateUserById(id: string, input: UpdateUserInput) {
  const { password, ...rest } = input;

  try {
    return await updateUser(id, {
      ...rest,
      ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {}),
    });
  } catch (e) {
    if (isPrismaError(e, "P2025")) throw notFound("Usuário");
    throw e;
  }
}

export async function deleteUserById(id: string) {
  try {
    return await deleteUser(id);
  } catch (e) {
    if (isPrismaError(e, "P2025")) throw notFound("Usuário");
    throw e;
  }
}
