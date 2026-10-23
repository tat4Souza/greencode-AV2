import { isPrismaError, notFound } from "../lib/errors.js";
import { findEquipmentById } from "../repositories/equipment.repository.js";
import {
  deleteMovement,
  findMovementsByEquipment,
} from "../repositories/movement.repository.js";

export async function getMovementsByEquipment(equipmentId: string) {
  const equipment = await findEquipmentById(equipmentId);
  if (!equipment) throw notFound("Equipamento");

  return findMovementsByEquipment(equipmentId);
}

export async function deleteMovementById(id: string) {
  try {
    await deleteMovement(id);
  } catch (e) {
    if (isPrismaError(e, "P2025")) throw notFound("Movimentação");
    throw e;
  }
}
