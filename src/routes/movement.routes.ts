import type { FastifyInstance } from "fastify";
import {
  idParamsSchema,
  type IdParamsSchema,
} from "../schemas/common.schema.js";
import { movementResponseSchema } from "../schemas/movements.schema.js";
import { getMovementsByEquipmentHandler } from "../controllers/movement.controller.js";
import { z } from "zod";
import { requireRole } from "../middlewares/auth.js";

async function movementRoutes(server: FastifyInstance) {
  const canWrite = { onRequest: [requireRole("ADMIN", "GESTOR")] };

  server.get<{ Params: IdParamsSchema }>(
    "/",
    {
      ...canWrite,
      schema: {
        params: idParamsSchema,
        response: { 200: z.array(movementResponseSchema) },
      },
    },
    getMovementsByEquipmentHandler,
  );
}

export default movementRoutes;
