import type { FastifyInstance } from "fastify";
import {
  idParamsSchema,
  type IdParamsSchema,
} from "../schemas/common.schema.js";
import { movementResponseSchema } from "../schemas/movements.schema.js";
import {
  deleteMovementHandler,
  getMovementsByEquipmentHandler,
} from "../controllers/movement.controller.js";
import { z } from "zod";
import { requireRole } from "../middlewares/auth.js";
import {
  movementCodeParamsSchema,
  type MovementCodeParams,
} from "../schemas/equipment.schema.js";

async function movementRoutes(server: FastifyInstance) {
  const canView = { onRequest: [requireRole("ADMIN", "GESTOR", "AUDITOR")] };
  const canWrite = { onRequest: [requireRole("ADMIN", "GESTOR")] };
  const movementsRoute = { tags: ["Movements"] };

  server.get<{ Params: IdParamsSchema }>(
    "/",
    {
      ...canView,
      schema: {
        ...movementsRoute,
        summary:
          "Lista os todas as moviemntações de um determinado equipamento",
        params: idParamsSchema,
        response: { 200: z.array(movementResponseSchema) },
      },
    },
    getMovementsByEquipmentHandler,
  );

  server.delete<{ Params: MovementCodeParams }>(
    "/:code",
    {
      ...canWrite,
      schema: {
        ...movementsRoute,
        summary: "Deleta a movimentação com id correspondente",
        params: movementCodeParamsSchema,
      },
    },
    deleteMovementHandler,
  );
}

export default movementRoutes;
