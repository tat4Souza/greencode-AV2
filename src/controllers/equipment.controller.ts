import type { FastifyReply, FastifyRequest } from "fastify";
import type { CreateEquipmentInput } from "../schemas/equipment.schema.js";
import type { IdParamsSchema } from "../schemas/common.schema.js";
import { registerEquipment } from "../services/equipment.service.js";

export async function registerEquipmentHandler(
  request: FastifyRequest<{
    Params: IdParamsSchema;
    Body: CreateEquipmentInput;
  }>,
  reply: FastifyReply,
) {
  const equipment = await registerEquipment(
    request.params.id,
    request.body,
    request.user.id,
  );
  return reply.code(201).send(equipment);
}
