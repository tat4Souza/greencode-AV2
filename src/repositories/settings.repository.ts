import { prisma } from "../lib/prisma.js";
import type { UpdateSettingsInput } from "../schemas/common.schema.js";

export async function updateSystemSettings(
  data: Omit<UpdateSettingsInput, "version">,
  version: number,
  userId: string,
) {
  let settings = await prisma.systemSetting.findFirst();

  if (!settings) {
    return await prisma.systemSetting.create({
      data: {
        ...data,
        updatedById: userId,
        version: 0,
      },
    });
  }

  const result = await prisma.systemSetting.updateMany({
    where: { id: settings.id, version },
    data: {
      ...data,
      updatedById: userId,
      version: { increment: 1 },
    },
  });

  return result.count;
}

export function findSystemSetting() {
  return prisma.systemSetting.findFirst();
}
