import bcrypt from "bcryptjs";
import type {
  CreateUserInput,
  UpdateUserInput,
} from "../schemas/user.schema.js";
import {
  createUser,
  deleteUser,
  findUserById,
  findUsers,
  updateUser,
} from "../repositories/user.repository.js";
import { conflict, isPrismaError, notFound } from "../lib/errors.js";

export async function registerUser(
  input: CreateUserInput,
  createdById: string,
) {
  const { password, ...rest } = input;
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    return await createUser({ ...rest, passwordHash, createdById });
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
  const { version, password, ...rest } = input;

  try {
    const count = await updateUser(id, version, {
      ...rest,
      ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {}),
    });

    if (count === 0) {
      const exists = await findUserById(id);
      if (!exists) throw notFound("Usuário");
      throw conflict(
        "Usuário foi alterado por outra pessoa. Recarregue os dados.",
      );
    }
    return await findUserById(id);
  } catch (e) {
    if (isPrismaError(e, "P2002")) throw conflict("Email já cadastrado");
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
