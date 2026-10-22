import bcrypt from "bcryptjs";
import {
  bumpTokenVersion,
  findUserAuthState,
  findUserByEmail,
  findUserWithPasswordById,
  updateUserPassword,
} from "../repositories/user.repository.js";
import { badRequest, notAuth } from "../lib/errors.js";

export async function validateCredentials(email: string, password: string) {
  const user = await findUserByEmail(email);

  if (
    !user ||
    !user.active ||
    !(await bcrypt.compare(password, user.passwordHash))
  ) {
    throw notAuth("Email ou senha inválidos");
  }

  const { passwordHash, ...publicUser } = user;
  return publicUser;
}

export async function isSessionValid(userId: string, tokenVersion: number) {
  const user = await findUserAuthState(userId);
  return !!user && user.active && user.tokenVersion === tokenVersion;
}

export async function logout(userId: string) {
  await bumpTokenVersion(userId);
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await findUserWithPasswordById(userId);
  if (!user || !user.active) throw notAuth("Sessão inválida");

  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw badRequest("Senha atual incorreta");
  }

  await updateUserPassword(userId, await bcrypt.hash(newPassword, 10));
}
