import { z } from "zod";
import {
  EquipmentType,
  PhysicalState,
  TrackingStatus,
} from "../generated/prisma/enums.js";

export const orgReportQuerySchema = z.object({
  start: z.coerce.date(),
  end: z.coerce.date(),
});
export const statusReportQuerySchema = z.object({
  status: z.enum(TrackingStatus),
});

export const orgReportResponseSchema = z.object({
  organization: z.object({ id: z.uuid(), name: z.string() }),
  period: z.object({ start: z.date(), end: z.date() }),
  totalBatches: z.number().int(),
  totalEquipments: z.number().int(),
});

export const statusReportResponseSchema = z.object({
  status: z.enum(TrackingStatus),
  total: z.number().int(),
  equipments: z.array(
    z.object({
      id: z.string(),
      type: z.enum(EquipmentType),
      physicalState: z.enum(PhysicalState),
      brand: z.string(),
      model: z.string(),
      batchId: z.uuid(),
    }),
  ),
});

export const financialReportResponseSchema = z.object({
  activeOrganizations: z.number().int(),
  organizationsWithValidContract: z.number().int(),
  grossMonthlyRevenue: z.number(),
  taxRate: z.number(),
  taxes: z.number(),
  netMonthlyRevenue: z.number(),
  annualDepreciationRate: z.number(),
});

export type OrgReportQuery = z.infer<typeof orgReportQuerySchema>;
export type StatusReportQuery = z.infer<typeof statusReportQuerySchema>;
