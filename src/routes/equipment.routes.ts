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
  changeEquipmentStateHandler,
  deleteEquipmentHandler,
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
import { requireRole } from "../middlewares/auth.js";
import {
  changeEquipmentStateSchema,
  type ChangeEquipmentStateInput,
} from "../schemas/movements.schema.js";
import movementRoutes from "./movement.routes.js";

async function equipmentsRoutes(server: FastifyInstance) {
  const canWrite = { onRequest: [requireRole("ADMIN", "GESTOR")] };

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

  server.put<{ Params: IdParamsSchema; Body: UpdateEquipmentInput }>(
    "/:id",
    {
      ...canWrite,
      schema: {
        params: idParamsSchema,
        body: updateEquipmentSchema,
        response: { 200: equipmentResponseSchema },
      },
    },
    updateEquipmentByIdHandler,
  );

  server.patch<{ Params: IdParamsSchema; Body: ChangeEquipmentStateInput }>(
    "/:id/status",
    {
      ...canWrite,
      onRequest: [requireRole("ADMIN", "GESTOR")],
      schema: {
        params: idParamsSchema,
        body: changeEquipmentStateSchema,
        response: { 200: equipmentResponseSchema },
      },
    },
    changeEquipmentStateHandler,
  );

  server.delete<{ Params: IdParamsSchema }>(
    "/:id",
    {
      ...canWrite,
      schema: {
        params: idParamsSchema,
      },
    },
    deleteEquipmentHandler,
  );

  server.register(movementRoutes, { prefix: "/:id/movements" });
}

export default equipmentsRoutes;
