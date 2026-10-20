import type { FastifyInstance } from "fastify";
import {
  deleteUserHandler,
  getUserByIdHandler,
  getUsersHandler,
  registerUserHandler,
  updateUserHandler,
} from "../controllers/user.controller.js";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
  userResponse,
} from "../schemas/user.schema.js";
import { requireRole } from "../middlewares/auth.js";
import { z } from "zod";
import {
  idParamsSchema,
  type IdParamsSchema,
} from "../schemas/common.schema.js";

async function userRoutes(server: FastifyInstance) {
  server.addHook("onRequest", requireRole("ADMIN"));

  server.post<{ Body: CreateUserInput }>(
    "/",
    {
      schema: {
        body: createUserSchema,
        response: { 201: userResponse },
      },
    },
    registerUserHandler,
  );
  server.get(
    "/",
    {
      schema: { response: { 200: z.array(userResponse) } },
    },
    getUsersHandler,
  );

  server.get<{ Params: IdParamsSchema }>(
    "/:id",
    {
      schema: {
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
        params: idParamsSchema,
      },
    },
    deleteUserHandler,
  );
}

export default userRoutes;
