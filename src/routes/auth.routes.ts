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
  const authTag = { tags: ["Auth"] };
  server.post(
    "/login",
    {
      schema: {
        ...authTag,
        summary: "Realizar login na aplicação",
        security: [],
        body: loginSchema,
        response: { 200: loginResponseSchema },
      },
    },
    loginHandler,
  );

  server.post(
    "/logout",
    {
      onRequest: [auth],
      schema: { ...authTag, summary: "Realizar logout na aplicação" },
    },
    logoutHandler,
  );

  server.patch<{ Body: ChangePasswordInput }>(
    "/password",
    {
      onRequest: [auth],
      schema: {
        ...authTag,
        summary: "Trocar a senha de um usuário",
        body: changePasswordSchema,
      },
    },
    changePasswordHandler,
  );
}

export default authRoutes;
