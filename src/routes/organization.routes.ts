import type { FastifyInstance } from "fastify";
import {
  deactivateOrgHandler,
  deleteOrgHandler,
  getOrgByIdHandler,
  getOrgsHandler,
  registerOrgHandler,
  updateOrgByIdHandler,
} from "../controllers/organization.controller.js";
import {
  createOrgSchema,
  listOrgsQuerySchema,
  orgResponseSchema,
  updateOrgSchema,
  type CreateOrgInput,
  type UpdateOrgInput,
} from "../schemas/organization.schema.js";
import {
  idParamsSchema,
  versionBodySchema,
  type IdParamsSchema,
  type VersionBody,
} from "../schemas/common.schema.js";
import { z } from "zod";
import contractRoutes from "./contract.routes.js";
import { requireRole } from "../middlewares/auth.js";

async function organizationRoutes(server: FastifyInstance) {
  server.addHook("onRequest", requireRole("ADMIN", "OPERADOR"));
  const orgsRoutes = { tags: ["Organizations"] };

  server.post<{ Body: CreateOrgInput }>(
    "/",
    {
      schema: {
        ...orgsRoutes,
        summary: "Cria uma novo organização",
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
        ...orgsRoutes,
        summary: "Exibe a organização com id correspondente",
        params: idParamsSchema,
        response: { 200: orgResponseSchema },
      },
    },
    getOrgByIdHandler,
  );

  server.get(
    "/",
    {
      schema: {
        ...orgsRoutes,
        summary: "Lista as organizações (por padrão exibe as ativas)",
        querystring: listOrgsQuerySchema,
        response: { 200: z.array(orgResponseSchema) },
      },
    },
    getOrgsHandler,
  );

  server.put<{ Params: IdParamsSchema; Body: UpdateOrgInput }>(
    "/:id",
    {
      schema: {
        ...orgsRoutes,
        summary: "Atualiza a organização com id correspondente",
        params: idParamsSchema,
        body: updateOrgSchema,
        response: { 200: orgResponseSchema },
      },
    },
    updateOrgByIdHandler,
  );

  server.register(contractRoutes, { prefix: "/:id/contract" });

  server.delete<{ Params: IdParamsSchema }>(
    "/:id",
    {
      schema: {
        ...orgsRoutes,
        summary: "Deleta a organização com id correspondente",
        params: idParamsSchema,
      },
    },
    deleteOrgHandler,
  );

  server.patch<{ Params: IdParamsSchema; Body: VersionBody }>(
    "/:id/deactivate",
    {
      schema: {
        ...orgsRoutes,
        summary: "Inativa a organização com id correspondente",
        params: idParamsSchema,
        body: versionBodySchema,
      },
    },
    deactivateOrgHandler,
  );
}

export default organizationRoutes;
