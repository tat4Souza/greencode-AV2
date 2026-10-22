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
  findExistingBarCodes,
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

  const codes = equipments.map((e) => e.barCode);

  const repeatedCodes = findDuplicates(codes);
  if (repeatedCodes.length > 0)
    throw badRequest(
      `Códigos de barras repetidos na lista: ${repeatedCodes.join(", ")}`,
    );

  const repeatedPositions = findDuplicates(
    equipments.map((e) => e.batchPosition),
  );
  if (repeatedPositions.length > 0)
    throw badRequest(
      `Posições repetidas na lista: ${repeatedPositions.join(", ")}`,
    );

  const org = await findOrgById(input.orgId);
  if (!org) throw notFound("Organização");

  if (codes.length > 0) {
    const existing = await findExistingBarCodes(codes);
    if (existing.length > 0)
      throw conflict(
        `Códigos de barras já cadastrados: ${existing.join(", ")}`,
      );
  }

  try {
    const batch = await createBatch({ ...input, createdById });
    return withTotalWeight(batch);
  } catch (e) {
    if (isPrismaError(e, "P2002"))
      throw conflict("Código de barras já cadastrado");
    throw e;
  }
}

export function getAllBatches(orgId?: string, status?: BatchStatus) {
  return findAllBatches({ orgId, status });
}

export async function getBatchById(id: string) {
  const batch = await findBatchById(id);

  if (!batch) throw notFound("Lote");

  return withTotalWeight(batch);
}

export async function updateBatchById(id: string, input: UpdateBatchInput) {
  const { version, ...changes } = input;

  if (Object.keys(changes).length === 0)
    throw badRequest("É necessário passar o conteúdo a ser editado");

  assertValidEnteredAt(changes.enteredAt);

  const count = await updateBatch(id, version, changes);

  if (count === 0) {
    const exists = await findBatchById(id);
    if (!exists) throw notFound("Lote");
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
