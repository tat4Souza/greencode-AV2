import type {
  EquipmentType,
  PhysicalState,
  TrackingStatus,
} from "../generated/prisma/enums.js";
import {
  badRequest,
  conflict,
  isPrismaError,
  notFound,
} from "../lib/errors.js";
import { assertBatchStatusRules } from "../lib/validators.js";
import { findBatchById } from "../repositories/batch.repository.js";
import {
  createEquipment,
  deleteEquipment,
  findActiveEquipmentById,
  findAllEquipments,
  findEquipmentById,
  updateEquipment,
} from "../repositories/equipment.repository.js";
import { applyMovement } from "../repositories/movement.repository.js";
import type {
  CreateEquipmentInput,
  UpdateEquipmentInput,
} from "../schemas/equipment.schema.js";
import type { ChangeEquipmentStateInput } from "../schemas/movements.schema.js";

export async function registerEquipment(
  batchId: string,
  input: CreateEquipmentInput,
  createdById: string,
) {
  const batch = await findBatchById(batchId);
  if (!batch) throw notFound("Lote");
  if (!batch.active)
    throw badRequest("Não é possível adicionar equipamentos a um lote inativo");

  if (batch.status !== "RECEBIDO" && batch.status !== "EM_TRIAGEM") {
    throw badRequest(
      `Não é possível adicionar novos equipamentos a um lote que já está em status '${batch.status}'`,
    );
  }

  try {
    return await createEquipment({ ...input, batchId, createdById });
  } catch (e) {
    if (isPrismaError(e, "P2002"))
      throw conflict("Posição já cadastrada neste lote");
    throw e;
  }
}

export async function getAllEquipments(filters: {
  batchId?: string;
  status?: TrackingStatus;
  type?: EquipmentType;
  active: boolean;
}) {
  return findAllEquipments(filters);
}

export async function getEquipmentById(id: string) {
  const equipment = await findActiveEquipmentById(id);
  if (!equipment) throw notFound("Equipamento");
  return equipment;
}

export async function updateEquipamentById(
  id: string,
  input: UpdateEquipmentInput,
  updatedBy: string,
) {
  const { version, ...changes } = input;
  const equipment = await findEquipmentById(id);
  if (!equipment) throw notFound("Equipamento");

  const batch = await findBatchById(equipment.batchId);
  if (!batch || !batch.active) {
    throw badRequest(
      "Não é possível atualizar um equipamento de um lote inativo ou inexistente",
    );
  }

  if (Object.keys(changes).length === 0)
    throw badRequest("É necessário passar o conteúdo a ser editado");

  try {
    const count = await updateEquipment(id, version, changes, updatedBy);
    if (count === 0) {
      throw conflict(
        "Equipamento já foi alterado por outra pessoa. Recarregue os dados.",
      );
    }
    return await getEquipmentById(id);
  } catch (e) {
    if (isPrismaError(e, "P2002"))
      throw conflict("Posição já cadastrada neste lote");
    throw e;
  }
}

const statusTransitions: Record<TrackingStatus, TrackingStatus[]> = {
  AGUARDANDO_TRIAGEM: ["EM_TRIAGEM"],
  EM_TRIAGEM: ["AGUARDANDO_DESMONTE", "DESCARTE_SEGURO"],
  AGUARDANDO_DESMONTE: ["EM_DESMONTE"],
  EM_DESMONTE: [
    "PECAS_REAPROVEITADAS",
    "MATERIAL_RECICLAVEL",
    "DESCARTE_SEGURO",
  ],
  PECAS_REAPROVEITADAS: ["BAIXA_DEFINITIVA"],
  MATERIAL_RECICLAVEL: ["BAIXA_DEFINITIVA"],
  DESCARTE_SEGURO: ["BAIXA_DEFINITIVA"],
  BAIXA_DEFINITIVA: [],
};

const physicalStateOrder: PhysicalState[] = [
  "NOVO",
  "BOM_ESTADO",
  "USADO_LEVE",
  "USADO_MODERADO",
  "DANIFICADO_LEVE",
  "DANIFICADO_GRAVE",
  "INSERVIVEL",
];

export async function changeEquipmentState(
  equipmentId: string,
  input: ChangeEquipmentStateInput,
  performedById: string,
) {
  const equipment = await findEquipmentById(equipmentId);
  if (!equipment) throw notFound("Equipamento");

  const batch = await findBatchById(equipment.batchId);
  if (!batch) throw notFound("Lote");

  if (!batch.active) {
    throw badRequest(
      "Não é possível alterar o estado de equipamentos de um lote inativo",
    );
  }

  if (batch.status === "FINALIZADO") {
    throw badRequest(
      "Não é possível alterar o estado de equipamentos de um lote já finalizado",
    );
  }

  const { version, status, physicalState, ...rest } = input;

  const newStatus = status && status !== equipment.status ? status : undefined;
  const newPhysicalState =
    physicalState && physicalState !== equipment.physicalState
      ? physicalState
      : undefined;

  if (!newStatus && !newPhysicalState) {
    throw badRequest("Informe um novo status ou um novo estado físico");
  }

  if (newStatus && !statusTransitions[equipment.status].includes(newStatus)) {
    throw badRequest(
      `Não é possível mudar de ${equipment.status} para ${newStatus}`,
    );
  }

  if (newPhysicalState) {
    const drop =
      physicalStateOrder.indexOf(newPhysicalState) -
      physicalStateOrder.indexOf(equipment.physicalState);
    if (drop >= 2 && !rest.justification) {
      throw badRequest(
        "Justificativa obrigatória quando o estado físico cai duas categorias ou mais",
      );
    }
  }

  const movement = await applyMovement({
    equipmentId,
    version,
    newStatus,
    newPhysicalState,
    movement: {
      origin: rest.origin ?? equipment.status,
      destination: rest.destination ?? newStatus ?? equipment.status,
      fromStatus: equipment.status,
      toStatus: newStatus ?? equipment.status,
      fromPhysicalState: newPhysicalState ? equipment.physicalState : null,
      toPhysicalState: newPhysicalState ?? null,
      justification: rest.justification,
      obs: rest.obs,
      performedById,
    },
  });

  if (!movement) {
    throw conflict(
      "Equipamento foi alterado por outra pessoa. Recarregue os dados.",
    );
  }

  return getEquipmentById(equipmentId);
}

export async function deleteEquipmentById(id: string) {
  try {
    await deleteEquipment(id);
  } catch (e) {
    if (isPrismaError(e, "P2025")) throw notFound("Equipamento");
    throw e;
  }
}
