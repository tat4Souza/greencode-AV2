import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  idParamsSchema,
  type IdParamsSchema,
} from "../schemas/common.schema.js";
import {
  movementParamsSchema,
  type MovementParams,
} from "../schemas/equipment.schema.js";
import { movementResponseSchema } from "../schemas/movements.schema.js";
import {
  deleteMovementHandler,
  getMovementsByEquipmentHandler,
} from "../controllers/movement.controller.js";

async function movementRoutes(server: FastifyInstance) {
  const movementsRoute = { tags: ["Movements"] };

  server.get<{ Params: IdParamsSchema }>(
    "/",
    {
      schema: {
        ...movementsRoute,
        summary: "Lista todas as movimentações de um equipamento",
        params: idParamsSchema,
        response: { 200: z.array(movementResponseSchema) },
      },
    },
    getMovementsByEquipmentHandler,
  );

  server.delete<{ Params: MovementParams }>(
    "/:movementId",
    {
      schema: {
        ...movementsRoute,
        summary: "Deleta a movimentação com id correspondente",
        params: movementParamsSchema,
      },
    },
    deleteMovementHandler,
  );
}

export default movementRoutes;
