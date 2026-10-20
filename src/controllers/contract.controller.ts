import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  CreateContractInput,
  UpdateContractInput,
} from "../schemas/contract.schema.js";
import {
  getContract,
  registerContract,
  updateContractById,
} from "../services/contract.service.js";
import type { IdParamsSchema } from "../schemas/common.schema.js";

export async function registerContractHandler(
  request: FastifyRequest<{
    Params: IdParamsSchema;
    Body: CreateContractInput;
  }>,
  reply: FastifyReply,
) {
  const contract = await registerContract(request.params.id, request.body);
  return reply.code(201).send(contract);
}

export async function getContractHandler(
  request: FastifyRequest<{ Params: IdParamsSchema }>,
  reply: FastifyReply,
) {
  const contract = await getContract(request.params.id);
  return reply.send(contract);
}

export async function updateContractHandler(
  request: FastifyRequest<{
    Params: IdParamsSchema;
    Body: UpdateContractInput;
  }>,
  reply: FastifyReply,
) {
  const contract = await updateContractById(request.params.id, request.body);
  return reply.send(contract);
}
