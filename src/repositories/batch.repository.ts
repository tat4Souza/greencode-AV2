import type { Prisma } from "../generated/prisma/client.js";
import type { BatchStatus } from "../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";
import type {
  CreateBatchInput,
  UpdateBatchInput,
} from "../schemas/batch.schema.js";
import { publicEquipmentSelect } from "./equipment.repository.js";

export const publicBatchSelect = {
  id: true,
  enteredAt: true,
  invoice: true,
  carrier: true,
  status: true,
  obs: true,
  createdAt: true,
  updatedAt: true,
  version: true,
  org: { select: { id: true, name: true, cnpj: true } },
  createdBy: { select: { id: true, username: true } },
  equipments: {
    select: publicEquipmentSelect,
    orderBy: { batchPosition: "asc" },
  },
  active: true,
} satisfies Prisma.BatchSelect;

export const batchListSelect = {
  id: true,
  enteredAt: true,
  invoice: true,
  carrier: true,
  status: true,
  version: true,
  org: { select: { id: true, name: true } },
  _count: { select: { equipments: true } },
} satisfies Prisma.BatchSelect;

export function createBatch(data: CreateBatchInput & { createdById: string }) {
  const { equipments, ...batchData } = data;

  return prisma.batch.create({
    data: {
      ...batchData,
      equipments: {
        create:
          equipments &&
          equipments.map((e, index) => ({
            ...e,
            batchPosition: index + 1,
            createdById: data.createdById,
          })),
      },
    },
    select: publicBatchSelect,
  });
}

export function findAllBatches(filters: {
  orgId?: string;
  status?: BatchStatus;
  active: boolean;
}) {
  return prisma.batch.findMany({
    select: batchListSelect,
    where: filters,
    orderBy: { enteredAt: "desc" },
  });
}

export function findBatchById(id: string) {
  return prisma.batch.findUnique({
    where: { id },
    select: publicBatchSelect,
  });
}

export async function updateBatch(
  id: string,
  version: number,
  data: Omit<UpdateBatchInput, "version">,
) {
  const result = await prisma.batch.updateMany({
    where: { id, version },
    data: { ...data, version: { increment: 1 } },
  });
  return result.count;
}

export async function updateBatchStatus(
  id: string,
  version: number,
  status: BatchStatus,
) {
  const result = await prisma.batch.updateMany({
    where: { id, version },
    data: { status, version: { increment: 1 } },
  });
  return result.count;
}

export async function findExisting(ids: string[]) {
  const found = await prisma.equipment.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  });
  return found.map((e) => e.id);
}

export async function deleteBatch(id: string) {
  return prisma.batch.delete({
    where: { id },
    select: { id: true },
  });
}

export async function updateBatchActiveStatus(
  id: string,
  version: number,
  value: boolean,
) {
  const result = await prisma.batch.updateMany({
    where: { id, version, active: true },
    data: { active: false, version: { increment: 1 } },
  });
  return result.count;
}
