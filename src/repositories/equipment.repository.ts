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
  barCode: true,
  type: true,
  brand: true,
  model: true,
  manufacturingYear: true,
  physicalState: true,
  weightKG: true,
  batchPosition: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  version: true,
  createdBy: { select: { id: true, username: true } },
} satisfies Prisma.EquipmentSelect;

export function createEquipment(
  data: CreateEquipmentInput & { batchId: string; createdById: string },
) {
  return prisma.equipment.create({ data, select: publicEquipmentSelect });
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

export function findEquipmentByBarcode(barCode: string) {
  return prisma.equipment.findUnique({
    where: { barCode },
    select: publicEquipmentSelect,
  });
}

export async function updateEquipment(
  id: string,
  version: number,
  data: Omit<UpdateEquipmentInput, "version">,
) {
  const result = await prisma.equipment.updateMany({
    where: { id, version },
    data: { ...data, version: { increment: 1 } },
  });
  return result.count;
}

export async function deleteEquipment(id: string) {
  return prisma.equipment.delete({
    where: { id },
    select: { id: true },
  });
}
