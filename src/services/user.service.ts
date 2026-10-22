import bcrypt from "bcryptjs";
import type {
  CreateUserInput,
  UpdateUserInput,
} from "../schemas/user.schema.js";
import {
  countActiveAdmins,
  createUser,
  deactivateUser,
  deleteUser,
  findUserById,
  findUsers,
  updateUser,
} from "../repositories/user.repository.js";
import {
  badRequest,
  conflict,
  isPrismaError,
  notFound,
} from "../lib/errors.js";
import type { Role } from "../generated/prisma/enums.js";

async function assertNotLastAdmin(role: Role) {
  if (role === "ADMIN" && (await countActiveAdmins()) <= 1) {
    throw badRequest("Não é possível remover o último administrador");
  }
}

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

export async function deactivateUserById(id: string, version: number) {
  const user = await findUserById(id);
  if (!user) throw notFound("Usuário");
  await assertNotLastAdmin(user.role);

  const count = await deactivateUser(id, version);
  if (count === 0)
    throw conflict(
      "Usuário foi alterado por outra pessoa. Recarregue os dados",
    );
}

export async function deleteUserById(id: string) {
  const user = await findUserById(id);
  if (!user) throw notFound("Usuário");
  await assertNotLastAdmin(user.role);

  try {
    await deleteUser(id);
  } catch (e) {
    if (isPrismaError(e, "P2025")) throw notFound("Usuário");
    if (isPrismaError(e, "P2003")) {
      throw conflict(
        "Usuário possui registros vinculados. Inative-o em vez de removê-lo.",
      );
    }
    throw e;
  }
}
