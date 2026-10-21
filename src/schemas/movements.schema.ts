import { z } from "zod";
import { PhysicalState, TrackingStatus } from "../generated/prisma/enums.js";

export const changeEquipmentStateSchema = z.object({
  status: z.enum(TrackingStatus).optional(),
  physicalState: z.enum(PhysicalState).optional(),
  justification: z.string().trim().min(1).optional(),
  origin: z.string().min(1).optional(),
  destination: z.string().min(1).optional(),
  obs: z.string().optional(),
  version: z.number().int().min(0),
});

export const movementResponseSchema = z.object({
  id: z.uuid(),
  equipmentId: z.uuid(),
  origin: z.string(),
  destination: z.string(),
  fromStatus: z.enum(TrackingStatus).nullable(),
  toStatus: z.enum(TrackingStatus),
  fromPhysicalState: z.enum(PhysicalState).nullable(),
  toPhysicalState: z.enum(PhysicalState).nullable(),
  justification: z.string().nullable(),
  obs: z.string().nullable(),
  performedAt: z.date(),
  performedBy: z.object({ id: z.uuid(), username: z.string() }),
});

export type ChangeEquipmentStateInput = z.infer<
  typeof changeEquipmentStateSchema
>;
