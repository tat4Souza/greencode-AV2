import type { TrackingStatus } from "../generated/prisma/enums.js";
import { badRequest, notFound } from "../lib/errors.js";
import { findOrgById } from "../repositories/organization.repository.js";
import {
  countOrgActivity,
  findEquipmentsByStatus,
  sumValidContracts,
} from "../repositories/report.repository.js";
import { findSystemSetting } from "../repositories/settings.repository.js";

const round2 = (n: number) => Math.round(n * 100) / 100;

export async function organizationReport(
  orgId: string,
  start: Date,
  end: Date,
) {
  if (start > end) throw badRequest("A data inicial deve ser anterior à final");

  const org = await findOrgById(orgId);
  if (!org) throw notFound("Organização");

  const endOfDay = new Date(end);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const { batches, equipments } = await countOrgActivity(
    orgId,
    start,
    endOfDay,
  );

  return {
    organization: { id: org.id, name: org.name },
    period: { start, end },
    totalBatches: batches,
    totalEquipments: equipments,
  };
}

export async function equipmentsByStatusReport(status: TrackingStatus) {
  const equipments = await findEquipmentsByStatus(status);
  return { status, total: equipments.length, equipments };
}

export async function financialReport() {
  const settings = await findSystemSetting();
  const taxRate = Number(settings?.taxRate ?? 10);
  const depreciationRate = Number(settings?.depreciationRate ?? 15);

  const { activeOrgs, validContracts, monthlyTotal } = await sumValidContracts(
    new Date(),
  );
  const taxes = monthlyTotal * (taxRate / 100);

  return {
    activeOrganizations: activeOrgs,
    organizationsWithValidContract: validContracts,
    grossMonthlyRevenue: round2(monthlyTotal),
    taxRate,
    taxes: round2(taxes),
    netMonthlyRevenue: round2(monthlyTotal - taxes),
    annualDepreciationRate: depreciationRate,
  };
}
