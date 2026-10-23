import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  CreateEquipmentInput,
  ListEquipmentsQuery,
  UpdateEquipmentInput,
} from "../schemas/equipment.schema.js";
import type { IdParamsSchema } from "../schemas/common.schema.js";
import {
  changeEquipmentState,
  deleteEquipmentById,
  getAllEquipments,
  getEquipmentById,
  registerEquipment,
  updateEquipamentById,
} from "../services/equipment.service.js";
import type { ChangeEquipmentStateInput } from "../schemas/movements.schema.js";

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

export async function getAllEquipmentsHandler(
  request: FastifyRequest<{ Querystring: ListEquipmentsQuery }>,
  reply: FastifyReply,
) {
  const { batchId, status, type } = request.query;

  const equipments = await getAllEquipments(batchId, status, type);

  return reply.send(equipments);
}

export async function getEquipmentByIdHandler(
  request: FastifyRequest<{ Params: IdParamsSchema }>,
  reply: FastifyReply,
) {
  const equipment = await getEquipmentById(request.params.id);

  return reply.send(equipment);
}

export async function updateEquipmentByIdHandler(
  request: FastifyRequest<{
    Params: IdParamsSchema;
    Body: UpdateEquipmentInput;
  }>,
  reply: FastifyReply,
) {
  const equipment = await updateEquipamentById(
    request.params.id,
    request.body,
    request.user.id,
  );
  return reply.send(equipment);
}

export async function changeEquipmentStateHandler(
  request: FastifyRequest<{
    Params: IdParamsSchema;
    Body: ChangeEquipmentStateInput;
  }>,
  reply: FastifyReply,
) {
  const equipment = await changeEquipmentState(
    request.params.id,
    request.body,
    request.user.id,
  );
  return reply.send(equipment);
}

export async function deleteEquipmentHandler(
  request: FastifyRequest<{ Params: IdParamsSchema }>,
  reply: FastifyReply,
) {
  await deleteEquipmentById(request.params.id);
  return reply.code(204).send();
}
