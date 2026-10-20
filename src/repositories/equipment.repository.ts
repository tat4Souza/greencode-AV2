import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import type { CreateEquipmentInput } from "../schemas/equipment.schema.js";

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
