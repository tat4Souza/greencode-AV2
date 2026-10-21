import type { FastifyReply, FastifyRequest } from "fastify";
import type { IdParamsSchema } from "../schemas/common.schema.js";
import { getMovementsByEquipment } from "../services/movement.service.js";

export async function getMovementsByEquipmentHandler(
  request: FastifyRequest<{ Params: IdParamsSchema }>,
  reply: FastifyReply,
) {
  const movements = await getMovementsByEquipment(request.params.id);
  return reply.send(movements);
}
