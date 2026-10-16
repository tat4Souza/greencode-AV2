import type { FastifyInstance } from "fastify";
import {
  deleteUserHandler,
  getUserByIdHandler,
  getUsersHandler,
  registerUserHandler,
  updateUserHandler,
} from "../controllers/user.controller.js";
import {
  createUserResponseSchema,
  createUserSchema,
  updateUserSchema,
  userIdParamsSchema,
  type UserIdParams,
  type CreateUserInput,
  type UpdateUserInput,
} from "../schemas/user.schema.js";
import { requireRole } from "../middlewares/auth.js";
import { z } from "zod";

async function userRoutes(server: FastifyInstance) {
  server.addHook("onRequest", requireRole("ADMIN"));

  server.post<{ Body: CreateUserInput }>(
    "/",
    {
      schema: {
        body: createUserSchema,
        response: { 201: createUserResponseSchema },
      },
    },
    registerUserHandler,
  );
  server.get(
    "/",
    {
      schema: { response: { 200: z.array(createUserResponseSchema) } },
    },
    getUsersHandler,
  );

  server.get<{ Params: UserIdParams }>(
    "/:id",
    {
      schema: {
        params: userIdParamsSchema,
        response: { 200: createUserResponseSchema },
      },
    },
    getUserByIdHandler,
  );

  server.put<{ Params: UserIdParams; Body: UpdateUserInput }>(
    "/:id",
    {
      schema: {
        params: userIdParamsSchema,
        body: updateUserSchema,
        response: { 200: createUserResponseSchema },
      },
    },
    updateUserHandler,
  );

  server.delete<{ Params: UserIdParams }>(
    "/:id",
    {
      schema: {
        params: userIdParamsSchema,
      },
    },
    deleteUserHandler,
  );
}

export default userRoutes;
