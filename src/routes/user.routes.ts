import type { FastifyInstance } from "fastify";
import {
  deactivateUserHandler,
  deleteUserHandler,
  getUserByIdHandler,
  getUsersHandler,
  reactivateUserHandler,
  registerUserHandler,
  updateUserHandler,
} from "../controllers/user.controller.js";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
  userResponse,
  listUsersQuerySchema,
} from "../schemas/user.schema.js";
import { requireRole } from "../middlewares/auth.js";
import { z } from "zod";
import {
  idParamsSchema,
  versionBodySchema,
  type IdParamsSchema,
  type VersionBody,
} from "../schemas/common.schema.js";

async function userRoutes(server: FastifyInstance) {
  server.addHook("onRequest", requireRole("ADMIN"));
  const userRoutes = { tags: ["Users"] };

  server.post<{ Body: CreateUserInput }>(
    "/",
    {
      schema: {
        ...userRoutes,
        summary: "Cria um novo usuário",
        body: createUserSchema,
        response: { 201: userResponse },
      },
    },
    registerUserHandler,
  );

  server.get(
    "/",
    {
      schema: {
        ...userRoutes,
        summary: "Lista os usuários (por padrão exibe os ativos)",
        querystring: listUsersQuerySchema,
        response: { 200: z.array(userResponse) },
      },
    },
    getUsersHandler,
  );

  server.get<{ Params: IdParamsSchema }>(
    "/:id",
    {
      schema: {
        ...userRoutes,
        summary: "Exibe o usuário com id correspondente",
        params: idParamsSchema,
        response: { 200: userResponse },
      },
    },
    getUserByIdHandler,
  );

  server.put<{ Params: IdParamsSchema; Body: UpdateUserInput }>(
    "/:id",
    {
      schema: {
        ...userRoutes,
        summary: "Atualiza o usuário com id correspondente",
        params: idParamsSchema,
        body: updateUserSchema,
        response: { 200: userResponse },
      },
    },
    updateUserHandler,
  );

  server.delete<{ Params: IdParamsSchema }>(
    "/:id",
    {
      schema: {
        ...userRoutes,
        summary: "Deleta o usuário com o id correspondente",
        params: idParamsSchema,
      },
    },
    deleteUserHandler,
  );

  server.patch<{ Params: IdParamsSchema; Body: VersionBody }>(
    "/:id/deactivate",
    {
      schema: {
        ...userRoutes,
        summary: "Inativa o usuário com o id correspondente",
        params: idParamsSchema,
        body: versionBodySchema,
      },
    },
    deactivateUserHandler,
  );

  server.patch<{ Params: IdParamsSchema; Body: VersionBody }>(
    "/:id/reactivate",
    {
      schema: {
        ...userRoutes,
        summary: "Ativa o usuário com o id correspondente",
        params: idParamsSchema,
        body: versionBodySchema,
      },
    },
    reactivateUserHandler,
  );
}

export default userRoutes;
