import type { FastifyReply, FastifyRequest } from "fastify";
import type { LoginInput } from "../schemas/auth.schema.js";

import bcrypt from "bcryptjs";
import { validateCredentials } from "../services/auth.service.js";

export async function loginHandler(
  request: FastifyRequest<{ Body: LoginInput }>,
  reply: FastifyReply,
) {
  const { email, password } = request.body;

  const user = await validateCredentials(email, password);

  const accessToken = await reply.jwtSign(
    { id: user.id, role: user.role },
    { expiresIn: "1h" },
  );

  return reply.send({ accessToken });
}
