import type { FastifyInstance } from "fastify";
import {
  barcodeParamsSchema,
  equipmentResponseSchema,
  listEquipmentsQuerySchema,
  updateEquipmentSchema,
  type BarcodeParams,
  type ListEquipmentsQuery,
  type UpdateEquipmentInput,
} from "../schemas/equipment.schema.js";
import {
  getAllEquipmentsHandler,
  getEquipmentByBarcodeHandler,
  getEquipmentByIdHandler,
  updateEquipmentByIdHandler,
} from "../controllers/equipment.controller.js";
import {
  idParamsSchema,
  type IdParamsSchema,
} from "../schemas/common.schema.js";
import { z } from "zod";

async function equipmentsRoutes(server: FastifyInstance) {
  // Listar todos os equipamentos cadastrados | Filtros: batchId, status, type | Papeis: TODOS
  server.get<{ Querystring: ListEquipmentsQuery }>(
    "/",
    {
      schema: {
        querystring: listEquipmentsQuerySchema,
        response: { 200: z.array(equipmentResponseSchema) },
      },
    },
    getAllEquipmentsHandler,
  );
  //
  // Buscar um equipamento por id | Papeis: TODOS
  server.get<{ Params: IdParamsSchema }>(
    "/:id",
    {
      schema: {
        params: idParamsSchema,
        response: { 200: equipmentResponseSchema },
      },
    },
    getEquipmentByIdHandler,
  );
  //
  // Busca pelo código de barras interno | Papeis: TODOS
  server.get<{ Params: BarcodeParams }>(
    "/barcode/:code",
    {
      schema: {
        params: barcodeParamsSchema,
        response: { 200: equipmentResponseSchema },
      },
    },
    getEquipmentByBarcodeHandler,
  );
  //
  // Edita os dados de um equipamento | Papeis: ADMIN, GESTOR
  server.put<{ Params: IdParamsSchema; Body: UpdateEquipmentInput }>(
    "/:id",
    {
      schema: {
        params: idParamsSchema,
        body: updateEquipmentSchema,
        response: { 200: equipmentResponseSchema },
      },
    },
    updateEquipmentByIdHandler,
  );
}

export default equipmentsRoutes;
