import type { FastifyReply, FastifyRequest } from "fastify";
import type { IdParamsSchema } from "../schemas/common.schema.js";
import {
  deleteMovementById,
  getMovementsByEquipment,
} from "../services/movement.service.js";
import type { BarcodeParams } from "../schemas/equipment.schema.js";

export async function getMovementsByEquipmentHandler(
  request: FastifyRequest<{ Params: IdParamsSchema }>,
  reply: FastifyReply,
) {
  const movements = await getMovementsByEquipment(request.params.id);
  return reply.send(movements);
}

export async function deleteMovementHandler(
  request: FastifyRequest<{ Params: BarcodeParams }>,
  reply: FastifyReply,
) {
  await deleteMovementById(request.params.code);
  return reply.code(204).send();
}
