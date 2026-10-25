import { isPrismaError, notFound } from "../lib/errors.js";
import { findActiveEquipmentById } from "../repositories/equipment.repository.js";
import {
  deleteMovement,
  findMovementsByEquipment,
} from "../repositories/movement.repository.js";

export async function getMovementsByEquipment(equipmentId: string) {
  const equipment = await findActiveEquipmentById(equipmentId);
  if (!equipment) throw notFound("Equipamento");
  return findMovementsByEquipment(equipmentId);
}

export async function deleteMovementById(
  equipmentId: string,
  movementId: string,
) {
  try {
    await deleteMovement(movementId, equipmentId);
  } catch (e) {
    if (isPrismaError(e, "P2025")) throw notFound("Movimentação");
    throw e;
  }
}
