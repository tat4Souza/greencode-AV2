import type { FastifyInstance } from "fastify";
import { loginResponseSchema, loginSchema } from "../schemas/auth.schema.js";
import { loginHandler } from "../controllers/auth.controller.js";

async function authRoutes(server: FastifyInstance) {
  server.post(
    "/",
    {
      schema: {
        body: loginSchema,
        response: { 200: loginResponseSchema },
      },
    },
    loginHandler,
  );
}

export default authRoutes;
