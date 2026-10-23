import { z } from "zod";
import {
  BatchStatus,
  EquipmentType,
  PhysicalState,
  TrackingStatus,
} from "../generated/prisma/enums.js";
import {
  createEquipmentSchema,
  equipmentResponseSchema,
} from "./equipment.schema.js";

export const listBatchesQuerySchema = z.object({
  orgId: z.uuid().optional(),
  status: z.enum(BatchStatus).optional(),
  active: z.stringbool().optional(),
});

export const createBatchSchema = z.object({
  orgId: z.uuid(),
  enteredAt: z.coerce.date().optional(),
  invoice: z.string().min(1),
  carrier: z.string().min(1),
  obs: z.string().optional(),
  equipments: z.array(createEquipmentSchema).optional(),
});

export const batchResponseSchema = z.object({
  id: z.uuid(),
  enteredAt: z.date(),
  invoice: z.string(),
  carrier: z.string(),
  obs: z.string().nullable(),
  status: z.enum(BatchStatus),
  createdAt: z.date(),
  updatedAt: z.date(),
  version: z.number().int(),
  org: z.object({ id: z.uuid(), name: z.string(), cnpj: z.string() }),
  createdBy: z.object({ id: z.uuid(), username: z.string() }),
  equipments: z.array(equipmentResponseSchema),
  totalWeightKG: z.number(),
  active: z.boolean(),
});

export const updateBatchSchema = createBatchSchema
  .pick({ invoice: true, carrier: true, obs: true, enteredAt: true })
  .partial()
  .extend({ version: z.number().int().min(0) });

export const updateBatchStatusSchema = z.object({
  status: z.enum(BatchStatus),
  version: z.number().int().min(0),
});

export const batchListItemSchema = z.object({
  id: z.uuid(),
  enteredAt: z.date(),
  invoice: z.string(),
  carrier: z.string(),
  status: z.enum(BatchStatus),
  version: z.number().int(),
  org: z.object({ id: z.uuid(), name: z.string() }),
  _count: z.object({ equipments: z.number().int() }),
});

export type UpdateBatchStatusInput = z.infer<typeof updateBatchStatusSchema>;
export type ListBatchesQuery = z.infer<typeof listBatchesQuerySchema>;
export type UpdateBatchInput = z.infer<typeof updateBatchSchema>;
export type CreateBatchInput = z.infer<typeof createBatchSchema>;
