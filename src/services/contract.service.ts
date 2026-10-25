import {
  badRequest,
  conflict,
  isPrismaError,
  notFound,
} from "../lib/errors.js";
import {
  createContract,
  deleteContract,
  findContract,
  updateContract,
} from "../repositories/contract.repository.js";
import { findOrgById } from "../repositories/organization.repository.js";
import type {
  CreateContractInput,
  UpdateContractInput,
} from "../schemas/contract.schema.js";

export async function registerContract(
  orgId: string,
  input: CreateContractInput,
  createdBy: string,
) {
  const org = await findOrgById(orgId);
  if (!org) throw notFound("Organização");
  if (!org.active)
    throw badRequest(
      "Não é possível adicionar contrato a uma organização inativa",
    );

  if (input.expiresAt <= new Date()) {
    throw badRequest("A data de vencimento deve ser futura");
  }

  try {
    return await createContract(orgId, input, createdBy);
  } catch (e) {
    if (isPrismaError(e, "P2002")) {
      throw conflict("Organização já possui contrato. Use a rota de edição");
    }
    throw e;
  }
}

export async function getContract(orgId: string) {
  const org = await findOrgById(orgId);
  if (!org) throw notFound("Organização");

  const contract = await findContract(orgId);

  if (!contract) throw notFound("Contrato");

  return contract;
}

export async function updateContractById(
  orgId: string,
  input: UpdateContractInput,
  updatedBy: string,
) {
  const { version, ...changes } = input;
  const contract = await findContract(orgId);
  if (!contract) throw notFound("Contrato");

  if (Object.keys(changes).length === 0)
    throw badRequest("É necessário passar o conteúdo a ser editado");

  if (changes.expiresAt && changes.expiresAt <= new Date()) {
    throw badRequest("A data de vencimento deve ser futura");
  }

  const count = await updateContract(orgId, version, changes, updatedBy);

  if (count === 0) {
    throw conflict(
      "Contrato já foi alterado por outra pessoa. Recarregue os dados.",
    );
  }
  return await findContract(orgId);
}

export async function deleteContractById(id: string) {
  try {
    await deleteContract(id);
  } catch (e) {
    if (isPrismaError(e, "P2025")) throw notFound("Contrato");
    throw e;
  }
}
