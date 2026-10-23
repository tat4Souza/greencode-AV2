import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  CreateBatchInput,
  ListBatchesQuery,
  UpdateBatchInput,
  UpdateBatchStatusInput,
} from "../schemas/batch.schema.js";
import {
  deactivateBatchById,
  deleteBatchById,
  getAllBatches,
  getBatchById,
  reactivateBatchById,
  registerBatch,
  updateBatchById,
  updateBatchByStatus,
} from "../services/batch.service.js";
import type { IdParamsSchema, VersionBody } from "../schemas/common.schema.js";
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
  const { orgId, status, active } = request.query;

  const batches = await getAllBatches(orgId, status, active);

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

export async function deleteBatchHandler(
  request: FastifyRequest<{ Params: IdParamsSchema }>,
  reply: FastifyReply,
) {
  await deleteBatchById(request.params.id);
  return reply.code(204).send();
}

export async function deactivateBatchHandler(
  request: FastifyRequest<{ Params: IdParamsSchema; Body: VersionBody }>,
  reply: FastifyReply,
) {
  await deactivateBatchById(request.params.id, request.body.version);
  return reply.code(204).send();
}

export async function reactivateBatchHandler(
  request: FastifyRequest<{ Params: IdParamsSchema; Body: VersionBody }>,
  reply: FastifyReply,
) {
  await reactivateBatchById(request.params.id, request.body.version);
  return reply.code(204).send();
}
