import type {
  PhysicalState,
  TrackingStatus,
} from "../generated/prisma/enums.js";
import { badRequest, conflict, notFound } from "../lib/errors.js";
import { findEquipmentById } from "../repositories/equipment.repository.js";
import {
  applyMovement,
  findMovementsByEquipment,
} from "../repositories/movement.repository.js";

export async function getMovementsByEquipment(equipmentId: string) {
  const equipment = await findEquipmentById(equipmentId);
  if (!equipment) throw notFound("Equipamento");

  return findMovementsByEquipment(equipmentId);
}
