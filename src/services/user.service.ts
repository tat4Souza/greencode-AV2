import bcrypt from "bcryptjs";
import type {
  CreateUserInput,
  UpdateUserInput,
} from "../schemas/user.schema.js";
import {
  bumpTokenVersion,
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
  const { password, ...changes } = input;
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    return await createUser({ ...changes, passwordHash, createdById });
  } catch (e) {
    if (isPrismaError(e, "P2002")) {
      throw conflict("Email já cadastrado");
    }
    throw e;
  }
}

export async function getUsers(role?: Role, active: boolean = true) {
  return findUsers({ role, active });
}

export async function getUserById(id: string) {
  const user = await findUserById(id);

  if (!user) throw notFound("Usuário");

  return user;
}

export async function updateUserById(id: string, input: UpdateUserInput) {
  const { version, ...changes } = input;
  const curUser = await findUserById(id);
  if (!curUser) throw notFound("Usuário");

  if (Object.keys(changes).length === 0)
    throw badRequest("É necessário passar o conteúdo a ser editado");

  try {
    if (
      changes.role !== undefined &&
      curUser.role === "ADMIN" &&
      changes.role !== "ADMIN"
    ) {
      assertNotLastAdmin(changes.role);
    }

    const count = await updateUser(id, version, { ...changes });

    if (count === 0) {
      throw conflict(
        "Usuário foi alterado por outra pessoa. Recarregue os dados.",
      );
    }

    if (
      (changes.role !== undefined && curUser.role !== changes.role) ||
      (changes.email !== undefined && curUser.email !== changes.email)
    ) {
      await bumpTokenVersion(id);
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
