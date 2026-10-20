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
import { createEquipment } from "../repositories/equipment.repository.js";
import type { CreateEquipmentInput } from "../schemas/equipment.schema.js";

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
