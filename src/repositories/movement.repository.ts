import type { Prisma } from "../generated/prisma/client.js";
import type {
  PhysicalState,
  TrackingStatus,
} from "../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";

export const publicMovementSelect = {
  id: true,
  equipmentId: true,
  origin: true,
  destination: true,
  fromStatus: true,
  toStatus: true,
  fromPhysicalState: true,
  toPhysicalState: true,
  justification: true,
  obs: true,
  performedAt: true,
  performedBy: { select: { id: true, username: true } },
} satisfies Prisma.MovementSelect;

type ApplyMovementData = {
  equipmentId: string;
  version: number;
  newStatus?: TrackingStatus;
  newPhysicalState?: PhysicalState;
  movement: {
    origin: string;
    destination: string;
    fromStatus: TrackingStatus;
    toStatus: TrackingStatus;
    fromPhysicalState: PhysicalState | null;
    toPhysicalState: PhysicalState | null;
    justification?: string;
    obs?: string;
    performedById: string;
  };
};

export function applyMovement(data: ApplyMovementData) {
  const { equipmentId, version, newStatus, newPhysicalState, movement } = data;

  return prisma.$transaction(async (tx) => {
    const result = await tx.equipment.updateMany({
      where: { id: equipmentId, version },
      data: {
        ...(newStatus && { status: newStatus }),
        ...(newPhysicalState && { physicalState: newPhysicalState }),
        version: { increment: 1 },
      },
    });

    if (result.count === 0) return null;

    return tx.movement.create({
      data: { equipmentId, ...movement },
      select: publicMovementSelect,
    });
  });
}

export function findMovementsByEquipment(equipmentId: string) {
  return prisma.movement.findMany({
    where: { equipmentId },
    select: publicMovementSelect,
    orderBy: { performedAt: "desc" },
  });
}

export async function deleteMovement(id: string, equipmentId: string) {
  return prisma.movement.delete({
    where: { id, equipmentId },
    select: { id: true },
  });
}
