import type { FastifyReply, FastifyRequest } from "fastify";
import {
  deleteUserById,
  getUserById,
  getUsers,
  registerUser,
  updateUserById,
} from "../services/user.service.js";
import type {
  CreateUserInput,
  UpdateUserInput,
} from "../schemas/user.schema.js";
import { forbidden } from "../lib/errors.js";
import type { IdParamsSchema } from "../schemas/common.schema.js";

export async function registerUserHandler(
  request: FastifyRequest<{
    Body: CreateUserInput;
  }>,
  reply: FastifyReply,
) {
  const user = await registerUser(request.body, request.user.id);
  return reply.code(201).send(user);
}

export async function getUsersHandler(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  const users = await getUsers();

  return reply.send(users);
}

export async function getUserByIdHandler(
  request: FastifyRequest<{ Params: IdParamsSchema }>,
  reply: FastifyReply,
) {
  const user = await getUserById(request.params.id);

  return reply.send(user);
}

export async function updateUserHandler(
  request: FastifyRequest<{ Params: IdParamsSchema; Body: UpdateUserInput }>,
  reply: FastifyReply,
) {
  const user = await updateUserById(request.params.id, request.body);

  return reply.send(user);
}

export async function deleteUserHandler(
  request: FastifyRequest<{ Params: IdParamsSchema }>,
  reply: FastifyReply,
) {
  if (request.user.id === request.params.id) {
    throw forbidden("Você não pode deletar a si mesmo");
  }

  await deleteUserById(request.params.id);
  return reply.code(204).send();
}
