import bcrypt from "bcryptjs";
import { findUserByEmail } from "../repositories/user.repository.js";
import { notAuth } from "../lib/errors.js";

export async function validateCredentials(email: string, password: string) {
  const user = await findUserByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw notAuth("Email ou senha inválidos");
  }

  const { passwordHash, ...publicUser } = user;
  return publicUser;
}
