import type { BatchStatus } from "../generated/prisma/enums.js";
import {
  badRequest,
  conflict,
  isPrismaError,
  notFound,
} from "../lib/errors.js";
import { assertValidEnteredAt, findDuplicates } from "../lib/validators.js";
import {
  createBatch,
  deactivateBatch,
  deleteBatch,
  findAllBatches,
  findBatchById,
  updateBatch,
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
  const equipments = input.equipments ?? [];

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

export async function updateBatchById(id: string, input: UpdateBatchInput) {
  const { version, ...changes } = input;
  const batch = await findBatchById(id);
  if (!batch) throw notFound("Lote");

  if (Object.keys(changes).length === 0)
    throw badRequest("É necessário passar o conteúdo a ser editado");

  assertValidEnteredAt(changes.enteredAt);

  const count = await updateBatch(id, version, changes);

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
) {
  const batch = await findBatchById(id);
  if (!batch) throw notFound("Lote");

  if (!transitions[batch.status].includes(status)) {
    throw badRequest(`Não é possível mudar de ${batch.status} para ${status}`);
  }

  const count = await updateBatchStatus(id, version, status);
  if (count === 0)
    throw conflict("Lote foi alterado por outra pessoa. Recarregue os dados.");

  return getBatchById(id);
}

export async function deactivateBatchById(id: string, version: number) {
  const batch = await findBatchById(id);
  if (!batch) throw notFound("Lote");

  const count = await deactivateBatch(id, version);
  if (count === 0)
    throw conflict("Lote foi alterado por outra pessoa. Recarregue os dados");
}

export async function deleteBatchById(id: string) {
  try {
    await deleteBatch(id);
  } catch (e) {
    if (isPrismaError(e, "P2025")) throw notFound("Lote");
    throw e;
  }
}
