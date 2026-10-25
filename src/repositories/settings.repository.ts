import { prisma } from "../lib/prisma.js";
import type { UpdateSettingsInput } from "../schemas/common.schema.js";

const SETTINGS_ID = "00000000-0000-0000-0000-000000000001";

type SettingsData = Omit<UpdateSettingsInput, "version">;

export function findSystemSetting() {
  return prisma.systemSetting.findUnique({ where: { id: SETTINGS_ID } });
}

export function createSystemSettings(data: SettingsData, userId: string) {
  return prisma.systemSetting.create({
    data: { id: SETTINGS_ID, ...data, updatedById: userId },
  });
}

export async function updateSystemSettings(
  data: SettingsData,
  version: number,
  userId: string,
) {
  const result = await prisma.systemSetting.updateMany({
    where: { id: SETTINGS_ID, version },
    data: { ...data, updatedById: userId, version: { increment: 1 } },
  });
  return result.count;
}
