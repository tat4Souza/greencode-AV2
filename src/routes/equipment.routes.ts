import type { FastifyInstance } from "fastify";
import {
  equipmentResponseSchema,
  listEquipmentsQuerySchema,
  updateEquipmentSchema,
  type ListEquipmentsQuery,
  type UpdateEquipmentInput,
} from "../schemas/equipment.schema.js";
import {
  changeEquipmentStateHandler,
  deleteEquipmentHandler,
  getAllEquipmentsHandler,
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
  server.addHook("onRequest", requireRole("ADMIN", "GESTOR"));
  const equipmentsRoute = { tags: ["Equipments"] };

  server.get<{ Querystring: ListEquipmentsQuery }>(
    "/",
    {
      schema: {
        ...equipmentsRoute,
        summary: "Lista os equipamentos",
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
        ...equipmentsRoute,
        summary: "Exibe o equipamento com id correspondente",
        params: idParamsSchema,
        response: { 200: equipmentResponseSchema },
      },
    },
    getEquipmentByIdHandler,
  );

  server.put<{ Params: IdParamsSchema; Body: UpdateEquipmentInput }>(
    "/:id",
    {
      schema: {
        ...equipmentsRoute,
        summary: "Atualiza o equipamento com id correspondente",
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
      schema: {
        ...equipmentsRoute,
        summary: "Atualiza o status do equipamento com id correspondente",
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
      schema: {
        ...equipmentsRoute,
        summary: "Deleta o equipamento com id correspondente",
        params: idParamsSchema,
      },
    },
    deleteEquipmentHandler,
  );

  server.register(movementRoutes, { prefix: "/:id/movements" });
}

export default equipmentsRoutes;
