import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  ChangePasswordInput,
  LoginInput,
} from "../schemas/auth.schema.js";
import {
  changePassword,
  logout,
  validateCredentials,
} from "../services/auth.service.js";
import { env } from "../lib/env.js";

export async function loginHandler(
  request: FastifyRequest<{ Body: LoginInput }>,
  reply: FastifyReply,
) {
  const { email, password } = request.body;

  const user = await validateCredentials(email, password);

  const accessToken = await reply.jwtSign(
    { id: user.id, role: user.role, tv: user.tokenVersion },
    { expiresIn: env.JWT_EXPIRES_IN },
  );

  return reply.send({ accessToken });
}

export async function logoutHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  await logout(request.user.id);
  return reply.code(204).send();
}

export async function changePasswordHandler(
  request: FastifyRequest<{ Body: ChangePasswordInput }>,
  reply: FastifyReply,
) {
  await changePassword(
    request.user.id,
    request.body.currentPassword,
    request.body.newPassword,
  );
  return reply.code(204).send();
}
