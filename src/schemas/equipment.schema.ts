import { z } from "zod";
import {
  EquipmentType,
  PhysicalState,
  TrackingStatus,
} from "../generated/prisma/enums.js";

export const createEquipmentSchema = z.object({
  type: z.enum(EquipmentType),
  brand: z.string().min(1),
  model: z.string().min(1),
  status: z.enum(TrackingStatus),
  manufacturingYear: z.int().min(1970).max(new Date().getFullYear()),
  physicalState: z.enum(PhysicalState),
  weightKG: z.number().positive(),
});

export const equipmentResponseSchema = z.object({
  id: z.uuid(),
  batchId: z.uuid(),
  type: z.enum(EquipmentType),
  brand: z.string(),
  model: z.string(),
  manufacturingYear: z.number().int(),
  physicalState: z.enum(PhysicalState),
  weightKG: z.coerce.number(),
  batchPosition: z.number().int(),
  status: z.enum(TrackingStatus),
  createdBy: z.object({ id: z.uuid(), username: z.string() }).nullable(),
  createdAt: z.date(),
  updatedBy: z.object({ id: z.uuid(), username: z.string() }).nullable(),
  updatedAt: z.date().nullable(),
  version: z.number(),
});

export const updateEquipmentSchema = createEquipmentSchema
  .omit({ physicalState: true })
  .partial()
  .extend({ version: z.number().int().min(0) });

export const listEquipmentsQuerySchema = z.object({
  batchId: z.uuid().optional(),
  status: z.enum(TrackingStatus).optional(),
  type: z.enum(EquipmentType).optional(),
});

export const movementCodeParamsSchema = z.object({ code: z.string().min(1) });

export type MovementCodeParams = z.infer<typeof movementCodeParamsSchema>;
export type ListEquipmentsQuery = z.infer<typeof listEquipmentsQuerySchema>;
export type UpdateEquipmentInput = z.infer<typeof updateEquipmentSchema>;
export type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>;
