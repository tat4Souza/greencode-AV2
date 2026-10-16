import type { FastifyReply, FastifyRequest } from "fastify";
import { createUser, findUserByEmail } from "../services/user.service.js";
import type { CreateUserInput, LoginInput } from "../schemas/user.schema.js";
import bcrypt from "bcryptjs";
import { server } from "../app.js";

export async function registerUserHandler(
  request: FastifyRequest<{
    Body: CreateUserInput;
  }>,
  reply: FastifyReply,
) {
  const body = request.body;

  try {
    const user = await createUser(body);

    return reply.code(201).send(user);
  } catch (e) {
    console.log(e);
    return reply.code(500).send(e);
  }
}

export async function loginHandler(
  request: FastifyRequest<{ Body: LoginInput }>,
  reply: FastifyReply,
) {
  const body = request.body;

  const user = await findUserByEmail(body.email);

  if (!user) {
    return reply.code(401).send({
      message: "Email ou senha inválidos",
    });
  }

  const correctPassword = await bcrypt.compare(
    body.password,
    user.passwordHash,
  );

  if (correctPassword) {
    const { passwordHash, ...rest } = user;
    return { accessToken: server.jwt.sign(rest) };
  }

  return reply.code(401).send({
    message: "Email ou senha inválidos",
  });
}
