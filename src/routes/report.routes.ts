import type { FastifyInstance } from "fastify";
import {
  idParamsSchema,
  type IdParamsSchema,
} from "../schemas/common.schema.js";
import {
  financialReportResponseSchema,
  orgReportQuerySchema,
  orgReportResponseSchema,
  statusReportQuerySchema,
  statusReportResponseSchema,
  type OrgReportQuery,
  type StatusReportQuery,
} from "../schemas/report.schema.js";
import {
  equipmentsByStatusReportHandler,
  financialReportHandler,
  organizationReportHandler,
} from "../controllers/report.controller.js";
import { requireRole } from "../middlewares/auth.js";

async function reportRoutes(server: FastifyInstance) {
  const reportRoute = { tags: ["Reports"] };
  server.addHook("onRequest", requireRole("ADMIN", "AUDITOR"));

  server.get<{ Params: IdParamsSchema; Querystring: OrgReportQuery }>(
    "/organizations/:id",
    {
      schema: {
        ...reportRoute,
        summary: "Retorna o relatório de uma organização",
        params: idParamsSchema,
        querystring: orgReportQuerySchema,
        response: { 200: orgReportResponseSchema },
      },
    },
    organizationReportHandler,
  );

  server.get<{ Querystring: StatusReportQuery }>(
    "/equipments-by-status",
    {
      schema: {
        ...reportRoute,
        summary: "Retorna o de equipamentos por status de rastreamento",
        querystring: statusReportQuerySchema,
        response: { 200: statusReportResponseSchema },
      },
    },
    equipmentsByStatusReportHandler,
  );

  server.get(
    "/financial",
    {
      schema: {
        ...reportRoute,
        summary: "Retorna o relatório financeiro",
        response: { 200: financialReportResponseSchema },
      },
    },
    financialReportHandler,
  );
}

export default reportRoutes;
