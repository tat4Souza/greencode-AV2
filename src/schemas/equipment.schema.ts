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

export type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>;
