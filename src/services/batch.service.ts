import type { BatchStatus } from "../generated/prisma/enums.js";
import {
  badRequest,
  conflict,
  isPrismaError,
  notFound,
} from "../lib/errors.js";
import {
  assertBatchStatusRules,
  assertValidEnteredAt,
} from "../lib/validators.js";
import {
  createBatch,
  deleteBatch,
  findAllBatches,
  findBatchById,
  updateBatch,
  updateBatchActiveStatus,
  updateBatchStatus,
} from "../repositories/batch.repository.js";
import { findOrgById } from "../repositories/organization.repository.js";
import type {
  CreateBatchInput,
  UpdateBatchInput,
} from "../schemas/batch.schema.js";

const transitions: Record<BatchStatus, BatchStatus[]> = {
  RECEBIDO: ["EM_TRIAGEM"],
  EM_TRIAGEM: ["TRIAGEM_CONCLUIDA"],
  TRIAGEM_CONCLUIDA: ["ENCAMINHADO"],
  ENCAMINHADO: ["FINALIZADO"],
  FINALIZADO: [],
};

function withTotalWeight<T extends { equipments: { weightKG: unknown }[] }>(
  batch: T,
) {
  const totalWeightKG = batch.equipments.reduce(
    (sum, e) => sum + Number(e.weightKG),
    0,
  );
  return { ...batch, totalWeightKG };
}

export async function registerBatch(
  input: CreateBatchInput,
  createdById: string,
) {
  assertValidEnteredAt(input.enteredAt);

  const org = await findOrgById(input.orgId);
  if (!org) throw notFound("Organização");

  if (!org.active)
    throw badRequest(
      "Não é possível adicionar lotes a uma organização inativa",
    );

  if (!org.contract || org.contract.expiresAt <= new Date())
    throw badRequest(
      "Não é possível adicionar lotes a uma organização sem contrato válido",
    );

  const batch = await createBatch({ ...input, createdById });
  return withTotalWeight(batch);
}

export function getAllBatches(
  orgId?: string,
  status?: BatchStatus,
  active: boolean = true,
) {
  return findAllBatches({ orgId, status, active });
}

export async function getBatchById(id: string) {
  const batch = await findBatchById(id);

  if (!batch) throw notFound("Lote");

  return withTotalWeight(batch);
}

export async function updateBatchById(
  id: string,
  input: UpdateBatchInput,
  updatedBy: string,
) {
  const { version, ...changes } = input;
  const batch = await findBatchById(id);
  if (!batch) throw notFound("Lote");

  if (!batch.active) {
    throw badRequest("Não é possível atualizar um lote inativo");
  }

  if (Object.keys(changes).length === 0)
    throw badRequest("É necessário passar o conteúdo a ser editado");

  if (changes.enteredAt) {
    assertValidEnteredAt(changes.enteredAt);
  }

  const count = await updateBatch(id, version, changes, updatedBy);

  if (count === 0) {
    throw conflict(
      "Lote já foi alterado por outra pessoa. Recarregue os dados.",
    );
  }

  return getBatchById(id);
}

export async function updateBatchByStatus(
  id: string,
  version: number,
  status: BatchStatus,
  updatedBy: string,
) {
  const batch = await findBatchById(id);
  if (!batch) throw notFound("Lote");

  if (!batch.active) {
    throw badRequest("Não é possível alterar o status de um lote inativo");
  }

  const equipments = batch.equipments;
  const statusEqMap = equipments.map((eq) => ({ status: eq.status }));

  assertBatchStatusRules(statusEqMap, status);

  if (!transitions[batch.status].includes(status)) {
    throw badRequest(`Não é possível mudar de ${batch.status} para ${status}`);
  }

  const count = await updateBatchStatus(id, version, status, updatedBy);
  if (count === 0)
    throw conflict("Lote foi alterado por outra pessoa. Recarregue os dados.");

  return getBatchById(id);
}

export async function deactivateBatchById(
  id: string,
  version: number,
  updatedBy: string,
) {
  const batch = await findBatchById(id);
  if (!batch) throw notFound("Lote");

  if (!batch.active) {
    throw badRequest("Este lote já está inativo");
  }

  const count = await updateBatchActiveStatus(id, version, false, updatedBy);
  if (count === 0)
    throw conflict("Lote foi alterado por outra pessoa. Recarregue os dados");
}

export async function reactivateBatchById(
  id: string,
  version: number,
  updatedBy: string,
) {
  const batch = await findBatchById(id);
  if (!batch) throw notFound("Lote");

  if (batch.active) {
    throw badRequest("Este lote já está ativo");
  }

  const count = await updateBatchActiveStatus(id, version, true, updatedBy);
  if (count === 0) {
    throw conflict("Lote foi alterado por outra pessoa. Recarregue os dados");
  }
}

export async function deleteBatchById(id: string) {
  try {
    await deleteBatch(id);
  } catch (e) {
    if (isPrismaError(e, "P2025")) throw notFound("Lote");
    throw e;
  }
}
