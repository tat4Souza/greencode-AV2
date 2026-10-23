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
  deleteContractHandler,
  getContractHandler,
  registerContractHandler,
  updateContractHandler,
} from "../controllers/contract.controller.js";
import { requireRole } from "../middlewares/auth.js";

async function contractRoutes(server: FastifyInstance) {
  server.addHook("onRequest", requireRole("ADMIN", "OPERADOR"));
  const contractRoutes = { tags: ["Organizations | Contract"] };

  server.post<{ Params: IdParamsSchema; Body: CreateContractInput }>(
    "/",
    {
      schema: {
        ...contractRoutes,
        summary: "Cria um contrato para um organização ativa",
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
        ...contractRoutes,
        summary: "Lista os contratos",
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
        ...contractRoutes,
        summary: "Atualiza o contrato da organização com id correspondente",
        params: idParamsSchema,
        body: updateContractSchema,
        response: { 200: contractResponseSchema },
      },
    },
    updateContractHandler,
  );

  server.delete<{ Params: IdParamsSchema }>(
    "/",
    {
      schema: {
        ...contractRoutes,
        summary: "Deleta o contrato da organização com id correspondente",
        params: idParamsSchema,
      },
    },
    deleteContractHandler,
  );
}

export default contractRoutes;
