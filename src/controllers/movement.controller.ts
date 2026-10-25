import type { FastifyReply, FastifyRequest } from "fastify";
import type { IdParamsSchema } from "../schemas/common.schema.js";
import type { MovementParams } from "../schemas/equipment.schema.js";
import {
  deleteMovementById,
  getMovementsByEquipment,
} from "../services/movement.service.js";

export async function getMovementsByEquipmentHandler(
  request: FastifyRequest<{ Params: IdParamsSchema }>,
  reply: FastifyReply,
) {
  const movements = await getMovementsByEquipment(request.params.id);
  return reply.send(movements);
}

export async function deleteMovementHandler(
  request: FastifyRequest<{ Params: MovementParams }>,
  reply: FastifyReply,
) {
  const { id, movementId } = request.params;
  await deleteMovementById(id, movementId);
  return reply.code(204).send();
}
