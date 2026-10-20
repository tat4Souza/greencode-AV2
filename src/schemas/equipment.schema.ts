import { z } from "zod";
import {
  EquipmentType,
  PhysicalState,
  TrackingStatus,
} from "../generated/prisma/enums.js";

export const createEquipmentSchema = z.object({
  barCode: z.string().min(1),
  type: z.enum(EquipmentType),
  brand: z.string().min(1),
  model: z.string().min(1),
  manufacturingYear: z.int().min(1970).max(new Date().getFullYear()),
  physicalState: z.enum(PhysicalState),
  weightKG: z.number().positive(),
  batchPosition: z.int().positive(),
});

export const equipmentResponseSchema = z.object({
  id: z.uuid(),
  batchId: z.uuid(),
  barCode: z.string(),
  type: z.enum(EquipmentType),
  brand: z.string(),
  model: z.string(),
  manufacturingYear: z.number().int(),
  physicalState: z.enum(PhysicalState),
  weightKG: z.coerce.number(),
  batchPosition: z.number().int(),
  status: z.enum(TrackingStatus),
  createdAt: z.date(),
  updatedAt: z.date(),
  version: z.number().int(),
  createdBy: z.object({ id: z.uuid(), username: z.string() }),
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

export const barcodeParamsSchema = z.object({ code: z.string().min(1) });

export type BarcodeParams = z.infer<typeof barcodeParamsSchema>;
export type ListEquipmentsQuery = z.infer<typeof listEquipmentsQuerySchema>;
export type UpdateEquipmentInput = z.infer<typeof updateEquipmentSchema>;
export type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>;
