import type { FastifyInstance } from "fastify";
import {
  loginHandler,
  registerUserHandler,
} from "../controllers/user.controller.js";
import {
  createUserResponseSchema,
  createUserSchema,
  loginResponseSchema,
  loginSchema,
  type CreateUserInput,
} from "../schemas/user.schema.js";

async function userRoutes(server: FastifyInstance) {
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

  server.post(
    "/login",
    {
      schema: {
        body: loginSchema,
        response: { 200: loginResponseSchema },
      },
    },
    loginHandler,
  );
}

export default userRoutes;
