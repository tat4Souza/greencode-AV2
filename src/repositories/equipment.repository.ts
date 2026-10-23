import type { Prisma } from "../generated/prisma/client.js";
import type {
  EquipmentType,
  TrackingStatus,
} from "../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";
import type {
  CreateEquipmentInput,
  UpdateEquipmentInput,
} from "../schemas/equipment.schema.js";

export const publicEquipmentSelect = {
  id: true,
  batchId: true,
  type: true,
  brand: true,
  model: true,
  manufacturingYear: true,
  physicalState: true,
  weightKG: true,
  batchPosition: true,
  status: true,
  createdBy: { select: { id: true, username: true } },
  createdAt: true,
  updatedBy: { select: { id: true, username: true } },
  updatedAt: true,
  version: true,
} satisfies Prisma.EquipmentSelect;

export function createEquipment(
  data: Omit<CreateEquipmentInput, "batchPosition"> & {
    batchId: string;
    createdById: string;
  },
) {
  return prisma.$transaction(async (tx) => {
    const last = await tx.equipment.aggregate({
      where: { batchId: data.batchId },
      _max: { batchPosition: true },
    });
    const batchPosition = (last._max.batchPosition ?? 0) + 1;

    return tx.equipment.create({
      data: { ...data, batchPosition },
      select: publicEquipmentSelect,
    });
  });
}

export function findAllEquipments(filters: {
  batchId?: string;
  status?: TrackingStatus;
  type?: EquipmentType;
}) {
  return prisma.equipment.findMany({
    select: publicEquipmentSelect,
    where: filters,
    orderBy: { createdAt: "desc" },
  });
}

export function findEquipmentById(id: string) {
  return prisma.equipment.findUnique({
    where: { id },
    select: publicEquipmentSelect,
  });
}

export async function updateEquipment(
  id: string,
  version: number,
  data: Omit<UpdateEquipmentInput, "version">,
  updatedById: string,
) {
  const result = await prisma.equipment.updateMany({
    where: { id, version },
    data: { ...data, version: { increment: 1 }, updatedById },
  });
  return result.count;
}

export async function deleteEquipment(id: string) {
  return prisma.equipment.delete({
    where: { id },
    select: { id: true },
  });
}
