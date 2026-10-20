import type { FastifyInstance } from "fastify";
import {
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
  type IdParamsSchema,
} from "../schemas/common.schema.js";
import { z } from "zod";
import { registerEquipmentHandler } from "../controllers/equipment.controller.js";
import {
  createEquipmentSchema,
  equipmentResponseSchema,
  type CreateEquipmentInput,
} from "../schemas/equipment.schema.js";

async function batchRoutes(server: FastifyInstance) {
  //   Criar lote com a lista de equipamentos no body | Papeis: ADMIN, GESTOR -> Aqui é para usar $transaction
  server.post<{ Body: CreateBatchInput }>(
    "/",
    {
      schema: {
        body: createBatchSchema,
        response: { 201: batchResponseSchema },
      },
    },
    registerBatchHandler,
  );
  //
  //   Lista todos os lotes cadastrados | Filtros: orgId e status | Papeis: TODOS
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
  //
  //   Devolve o lote com os equipamentos e o peso total calculado pela função | Papeis: TODOS
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
  //
  //   Edita as informações do próprio lote (não as do equipamento), com version | Papeis: ADMIN, GESTOR
  server.put<{ Params: IdParamsSchema; Body: UpdateBatchInput }>(
    "/:id",
    {
      schema: {
        params: idParamsSchema,
        body: updateBatchSchema,
        response: { 200: batchResponseSchema },
      },
    },
    updateBatchByIdHandler,
  );
  //
  //   Muda o status, com version | Papeis: ADMIN, GESTOR
  server.patch<{ Params: IdParamsSchema; Body: UpdateBatchStatusInput }>(
    "/:id/status",
    {
      schema: {
        params: idParamsSchema,
        body: updateBatchStatusSchema,
        response: { 200: batchResponseSchema },
      },
    },
    updateBatchByStatusHandler,
  );
  //
  //   ROTA DO EQUIPAMENTO
  server.post<{ Params: IdParamsSchema; Body: CreateEquipmentInput }>(
    "/:id/equipments",
    {
      schema: {
        params: idParamsSchema,
        body: createEquipmentSchema,
        response: { 201: equipmentResponseSchema },
      },
    },
    registerEquipmentHandler,
  );
}

export default batchRoutes;
