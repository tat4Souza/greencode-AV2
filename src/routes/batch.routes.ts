import type { FastifyInstance } from "fastify";
import {
  deactivateBatchHandler,
  deleteBatchHandler,
  getAllBatchesHandler,
  getBatchByIdHandler,
  registerBatchHandler,
  updateBatchByIdHandler,
  updateBatchByStatusHandler,
} from "../controllers/batch.controller.js";
import {
  batchListItemSchema,
  batchResponseSchema,
  createBatchSchema,
  listBatchesQuerySchema,
  updateBatchSchema,
  updateBatchStatusSchema,
  type CreateBatchInput,
  type ListBatchesQuery,
  type UpdateBatchInput,
  type UpdateBatchStatusInput,
} from "../schemas/batch.schema.js";
import {
  idParamsSchema,
  versionBodySchema,
  type IdParamsSchema,
  type VersionBody,
} from "../schemas/common.schema.js";
import { z } from "zod";
import { registerEquipmentHandler } from "../controllers/equipment.controller.js";
import {
  createEquipmentSchema,
  equipmentResponseSchema,
  type CreateEquipmentInput,
} from "../schemas/equipment.schema.js";
import { requireRole } from "../middlewares/auth.js";

async function batchRoutes(server: FastifyInstance) {
  const canWrite = { onRequest: [requireRole("ADMIN", "GESTOR")] };

  server.post<{ Body: CreateBatchInput }>(
    "/",
    {
      ...canWrite,
      schema: {
        body: createBatchSchema,
        response: { 201: batchResponseSchema },
      },
    },
    registerBatchHandler,
  );

  server.get<{ Querystring: ListBatchesQuery }>(
    "/",
    {
      schema: {
        querystring: listBatchesQuerySchema,
        response: { 200: z.array(batchListItemSchema) },
      },
    },
    getAllBatchesHandler,
  );

  server.get<{ Params: IdParamsSchema }>(
    "/:id",
    {
      schema: {
        params: idParamsSchema,
        response: { 200: batchResponseSchema },
      },
    },
    getBatchByIdHandler,
  );

  server.put<{ Params: IdParamsSchema; Body: UpdateBatchInput }>(
    "/:id",
    {
      ...canWrite,
      schema: {
        params: idParamsSchema,
        body: updateBatchSchema,
        response: { 200: batchResponseSchema },
      },
    },
    updateBatchByIdHandler,
  );

  server.patch<{ Params: IdParamsSchema; Body: UpdateBatchStatusInput }>(
    "/:id/status",
    {
      ...canWrite,
      schema: {
        params: idParamsSchema,
        body: updateBatchStatusSchema,
        response: { 200: batchResponseSchema },
      },
    },
    updateBatchByStatusHandler,
  );

  server.post<{ Params: IdParamsSchema; Body: CreateEquipmentInput }>(
    "/:id/equipments",
    {
      ...canWrite,
      schema: {
        params: idParamsSchema,
        body: createEquipmentSchema,
        response: { 201: equipmentResponseSchema },
      },
    },
    registerEquipmentHandler,
  );

  server.delete<{ Params: IdParamsSchema }>(
    "/:id",
    {
      ...canWrite,
      schema: {
        params: idParamsSchema,
      },
    },
    deleteBatchHandler,
  );

  server.patch<{ Params: IdParamsSchema; Body: VersionBody }>(
    "/:id/deactivate",
    { schema: { params: idParamsSchema, body: versionBodySchema } },
    deactivateBatchHandler,
  );
}

export default batchRoutes;
