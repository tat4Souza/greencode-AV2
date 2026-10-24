import type { TrackingStatus } from "../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";

export async function countOrgActivity(orgId: string, start: Date, end: Date) {
  const batchWhere = {
    orgId,
    active: true,
    enteredAt: { gte: start, lte: end },
  };

  const [batches, equipments] = await Promise.all([
    prisma.batch.count({ where: batchWhere }),
    prisma.equipment.count({ where: { batch: batchWhere } }),
  ]);
  return { batches, equipments };
}

export function findEquipmentsByStatus(status: TrackingStatus) {
  return prisma.equipment.findMany({
    where: { status, batch: { active: true } },
    select: {
      id: true,
      brand: true,
      model: true,
      batchId: true,
      type: true,
      physicalState: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function sumValidContracts(now: Date) {
  const [activeOrgs, contracts] = await Promise.all([
    prisma.organization.count({ where: { active: true } }),
    prisma.contract.aggregate({
      where: { expiresAt: { gt: now }, org: { active: true } },
      _sum: { monthlyValue: true },
      _count: true,
    }),
  ]);

  return {
    activeOrgs,
    validContracts: contracts._count,
    monthlyTotal: Number(contracts._sum.monthlyValue ?? 0),
  };
}
