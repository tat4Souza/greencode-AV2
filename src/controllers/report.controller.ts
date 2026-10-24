import type { FastifyReply, FastifyRequest } from "fastify";
import type { IdParamsSchema } from "../schemas/common.schema.js";
import type {
  OrgReportQuery,
  StatusReportQuery,
} from "../schemas/report.schema.js";
import {
  equipmentsByStatusReport,
  financialReport,
  organizationReport,
} from "../services/reports.service.js";

export async function organizationReportHandler(
  request: FastifyRequest<{
    Params: IdParamsSchema;
    Querystring: OrgReportQuery;
  }>,
  reply: FastifyReply,
) {
  const { start, end } = request.query;
  const report = await organizationReport(request.params.id, start, end);
  return reply.send(report);
}

export async function equipmentsByStatusReportHandler(
  request: FastifyRequest<{ Querystring: StatusReportQuery }>,
  reply: FastifyReply,
) {
  const report = await equipmentsByStatusReport(request.query.status);
  return reply.send(report);
}

export async function financialReportHandler(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  const report = await financialReport();
  return reply.send(report);
}
