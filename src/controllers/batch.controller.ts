import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  CreateBatchInput,
  ListBatchesQuery,
  UpdateBatchInput,
  UpdateBatchStatusInput,
} from "../schemas/batch.schema.js";
import {
  getAllBatches,
  getBatchById,
  registerBatch,
  updateBatchById,
  updateBatchByStatus,
} from "../services/batch.service.js";
import type { IdParamsSchema } from "../schemas/common.schema.js";
import type { BatchStatus } from "../generated/prisma/enums.js";

export async function registerBatchHandler(
  request: FastifyRequest<{ Body: CreateBatchInput }>,
  reply: FastifyReply,
) {
  const batch = await registerBatch(request.body, request.user.id);
  return reply.code(201).send(batch);
}

export async function getAllBatchesHandler(
  request: FastifyRequest<{ Querystring: ListBatchesQuery }>,
  reply: FastifyReply,
) {
  const { orgId, status } = request.query;

  const batches = await getAllBatches(orgId, status);

  return reply.send(batches);
}

export async function getBatchByIdHandler(
  request: FastifyRequest<{ Params: IdParamsSchema }>,
  reply: FastifyReply,
) {
  const batch = await getBatchById(request.params.id);

  return reply.send(batch);
}

export async function updateBatchByIdHandler(
  request: FastifyRequest<{ Params: IdParamsSchema; Body: UpdateBatchInput }>,
  reply: FastifyReply,
) {
  const batch = await updateBatchById(request.params.id, request.body);
  return reply.send(batch);
}

export async function updateBatchByStatusHandler(
  request: FastifyRequest<{
    Params: IdParamsSchema;
    Body: UpdateBatchStatusInput;
  }>,
  reply: FastifyReply,
) {
  const batch = await updateBatchByStatus(
    request.params.id,
    request.body.version,
    request.body.status,
  );
  return reply.send(batch);
}
