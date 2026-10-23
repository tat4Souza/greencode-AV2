import type { FastifyReply, FastifyRequest } from "fastify";
import {
  deactivateOrgById,
  deleteOrgById,
  getOrgById,
  getOrgs,
  reactivateOrgById,
  registerOrganization,
  updateOrgById,
} from "../services/organization.service.js";
import type {
  CreateOrgInput,
  ListOrgsQuery,
  UpdateOrgInput,
} from "../schemas/organization.schema.js";
import type { IdParamsSchema, VersionBody } from "../schemas/common.schema.js";

export async function registerOrgHandler(
  request: FastifyRequest<{ Body: CreateOrgInput }>,
  reply: FastifyReply,
) {
  const organization = await registerOrganization(
    request.body,
    request.user.id,
  );
  return reply.code(201).send(organization);
}

export async function getOrgByIdHandler(
  request: FastifyRequest<{ Params: IdParamsSchema }>,
  reply: FastifyReply,
) {
  const organization = await getOrgById(request.params.id);

  return reply.send(organization);
}

export async function getOrgsHandler(
  request: FastifyRequest<{ Querystring: ListOrgsQuery }>,
  reply: FastifyReply,
) {
  const { active, contract } = request.query;

  const organizations = await getOrgs(active, contract);

  return reply.send(organizations);
}

export async function updateOrgByIdHandler(
  request: FastifyRequest<{ Params: IdParamsSchema; Body: UpdateOrgInput }>,
  reply: FastifyReply,
) {
  const organization = await updateOrgById(
    request.params.id,
    request.body,
    request.user.id,
  );
  return reply.send(organization);
}

export async function deleteOrgHandler(
  request: FastifyRequest<{ Params: IdParamsSchema }>,
  reply: FastifyReply,
) {
  await deleteOrgById(request.params.id);
  return reply.code(204).send();
}

export async function deactivateOrgHandler(
  request: FastifyRequest<{ Params: IdParamsSchema; Body: VersionBody }>,
  reply: FastifyReply,
) {
  await deactivateOrgById(
    request.params.id,
    request.body.version,
    request.user.id,
  );
  return reply.code(204).send();
}

export async function reactivateOrgHandler(
  request: FastifyRequest<{ Params: IdParamsSchema; Body: VersionBody }>,
  reply: FastifyReply,
) {
  await reactivateOrgById(
    request.params.id,
    request.body.version,
    request.user.id,
  );
  return reply.code(204).send();
}
