import type { FastifyInstance } from "fastify";
import { requireRole } from "../middlewares/auth.js";
import {
  responseSettingsSchema,
  updateSettingsSchema,
  type UpdateSettingsInput,
} from "../schemas/common.schema.js";
import {
  getSettingsHandler,
  updateSettingsHandler,
} from "../controllers/settings.controller.js";

async function settingsRoute(server: FastifyInstance) {
  server.addHook("onRequest", requireRole("ADMIN"));
  const settingsRoute = { tags: ["Global Settings"] };

  server.get(
    "/",
    {
      schema: {
        ...settingsRoute,
        summary: "Exibe as configurações globais do sistema",
        response: { 200: responseSettingsSchema },
      },
    },
    getSettingsHandler,
  );

  server.patch<{ Body: UpdateSettingsInput }>(
    "/",
    {
      schema: {
        ...settingsRoute,
        summary:
          "Atualiza as configurações globais (cria uma nova para caso ela ainda n exista)",
        body: updateSettingsSchema,
        response: { 200: responseSettingsSchema },
      },
    },
    updateSettingsHandler,
  );
}

export default settingsRoute;
