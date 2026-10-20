import type { FastifyInstance } from "fastify";
import {
  getActiveOrgsHandler,
  getOrgByIdHandler,
  registerOrgHandler,
  updateOrgByIdHandler,
} from "../controllers/organization.controller.js";
import {
  createOrgSchema,
  orgResponseSchema,
  updateOrgSchema,
  type CreateOrgInput,
  type UpdateOrgInput,
} from "../schemas/organization.schema.js";
import {
  idParamsSchema,
  type IdParamsSchema,
} from "../schemas/common.schema.js";
import { z } from "zod";
import { contractRoutes } from "./contract.routes.js";
import { requireRole } from "../middlewares/auth.js";

export async function organizationRoutes(server: FastifyInstance) {
  server.addHook("onRequest", requireRole("OPERADOR"));

  server.post<{ Body: CreateOrgInput }>(
    "/",
    {
      schema: {
        body: createOrgSchema,
        response: { 201: orgResponseSchema },
      },
    },
    registerOrgHandler,
  );
  server.get<{ Params: IdParamsSchema }>(
    "/:id",
    {
      schema: {
        params: idParamsSchema,
        response: { 200: orgResponseSchema },
      },
    },
    getOrgByIdHandler,
  );

  server.get(
    "/",
    {
      schema: { response: { 200: z.array(orgResponseSchema) } },
    },
    getActiveOrgsHandler,
  );

  server.put<{ Params: IdParamsSchema; Body: UpdateOrgInput }>(
    "/:id",
    {
      schema: {
        params: idParamsSchema,
        body: updateOrgSchema,
        response: { 200: orgResponseSchema },
      },
    },
    updateOrgByIdHandler,
  );

  server.register(contractRoutes, { prefix: "/:id/contract" });

  // falta um delete com o soft delete
}
