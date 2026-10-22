import type { FastifyInstance } from "fastify";
import {
  changePasswordSchema,
  loginResponseSchema,
  loginSchema,
  type ChangePasswordInput,
} from "../schemas/auth.schema.js";
import {
  changePasswordHandler,
  loginHandler,
  logoutHandler,
} from "../controllers/auth.controller.js";
import { auth } from "../middlewares/auth.js";

async function authRoutes(server: FastifyInstance) {
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

  server.post("/logout", { onRequest: [auth] }, logoutHandler);

  server.patch<{ Body: ChangePasswordInput }>(
    "/password",
    { onRequest: [auth], schema: { body: changePasswordSchema } },
    changePasswordHandler,
  );
}

export default authRoutes;
