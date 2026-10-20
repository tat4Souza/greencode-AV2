import type { FastifyInstance } from "fastify";
import {
  idParamsSchema,
  type IdParamsSchema,
} from "../schemas/common.schema.js";
import {
  contractResponseSchema,
  contractSchema,
  updateContractSchema,
  type CreateContractInput,
  type UpdateContractInput,
} from "../schemas/contract.schema.js";
import {
  getContractHandler,
  registerContractHandler,
  updateContractHandler,
} from "../controllers/contract.controller.js";

async function contractRoutes(server: FastifyInstance) {
  server.post<{ Params: IdParamsSchema; Body: CreateContractInput }>(
    "/",
    {
      schema: {
        params: idParamsSchema,
        body: contractSchema,
        response: { 201: contractResponseSchema },
      },
    },
    registerContractHandler,
  );

  server.get<{ Params: IdParamsSchema }>(
    "/",
    {
      schema: {
        params: idParamsSchema,
        response: { 200: contractResponseSchema },
      },
    },
    getContractHandler,
  );

  server.put<{ Params: IdParamsSchema; Body: UpdateContractInput }>(
    "/",
    {
      schema: {
        params: idParamsSchema,
        body: updateContractSchema,
        response: { 200: contractResponseSchema },
      },
    },
    updateContractHandler,
  );
}

export default contractRoutes;
