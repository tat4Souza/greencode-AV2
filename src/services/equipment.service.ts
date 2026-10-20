import type {
  EquipmentType,
  TrackingStatus,
} from "../generated/prisma/enums.js";
import {
  badRequest,
  conflict,
  isPrismaError,
  notFound,
} from "../lib/errors.js";
import {
  findBatchById,
  findExistingBarCodes,
} from "../repositories/batch.repository.js";
import {
  createEquipment,
  findAllEquipments,
  findEquipmentByBarcode,
  findEquipmentById,
  updateEquipment,
} from "../repositories/equipment.repository.js";
import type {
  CreateEquipmentInput,
  UpdateEquipmentInput,
} from "../schemas/equipment.schema.js";

export async function registerEquipment(
  batchId: string,
  input: CreateEquipmentInput,
  createdById: string,
) {
  const batch = await findBatchById(batchId);
  if (!batch) throw notFound("Lote");

  if (batch.status === "ENCAMINHADO" || batch.status === "FINALIZADO") {
    throw badRequest(
      `Não é possível adicionar equipamentos a um lote ${batch.status}`,
    );
  }

  const existing = await findExistingBarCodes([input.barCode]);
  if (existing.length > 0)
    throw conflict(`Código de barras já cadastrado: ${existing.join(", ")}`);

  try {
    return await createEquipment({ ...input, batchId, createdById });
  } catch (e) {
    if (isPrismaError(e, "P2002"))
      throw conflict("Código de barras ou posição já cadastrados neste lote");
    throw e;
  }
}

export async function getAllEquipments(
  batchId?: string,
  status?: TrackingStatus,
  type?: EquipmentType,
) {
  return findAllEquipments({ batchId, status, type });
}

export async function getEquipmentById(id: string) {
  const equipment = await findEquipmentById(id);

  if (!equipment) throw notFound("Equipamento");

  return equipment;
}

export async function getEquipmentByBarcode(id: string) {
  const equipment = await findEquipmentByBarcode(id);

  if (!equipment) throw notFound("Equipamento");

  return equipment;
}

export async function updateEquipamentById(
  id: string,
  input: UpdateEquipmentInput,
) {
  const { version, ...changes } = input;

  if (Object.keys(changes).length === 0)
    throw badRequest("É necessário passar o conteúdo a ser editado");

  try {
    const count = await updateEquipment(id, version, changes);
    if (count === 0) {
      const exists = await findEquipmentById(id);
      if (!exists) throw notFound("Equipamento");
      throw conflict(
        "Equipamento já foi alterado por outra pessoa. Recarregue os dados.",
      );
    }
    return await getEquipmentById(id);
  } catch (e) {
    if (isPrismaError(e, "P2002"))
      throw conflict("Código de barras ou posição já cadastrados neste lote");
    throw e;
  }
}
