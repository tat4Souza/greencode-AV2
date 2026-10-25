import { badRequest, conflict, isPrismaError } from "../lib/errors.js";
import {
  createSystemSettings,
  findSystemSetting,
  updateSystemSettings,
} from "../repositories/settings.repository.js";
import type { UpdateSettingsInput } from "../schemas/common.schema.js";

export async function getSettings() {
  const settings = await findSystemSetting();

  if (!settings) {
    return {
      taxRate: 10.0,
      depreciationRate: 15.0,
      version: 0,
    };
  }

  return settings;
}

export async function updateSettings(
  input: UpdateSettingsInput,
  userId: string,
) {
  const { version, ...changes } = input;
  const current = await findSystemSetting();

  if (!current) {
    try {
      await createSystemSettings(changes, userId);
    } catch (e) {
      if (isPrismaError(e, "P2002")) {
        throw conflict(
          "As configurações globais acabaram de ser criadas por outro administrador. Recarregue os dados.",
        );
      }
      throw e;
    }
    return findSystemSetting();
  }

  const count = await updateSystemSettings(changes, version, userId);
  if (count === 0) {
    throw conflict(
      "Configurações Globais já foram alteradas por outro administrador. Recarregue os dados.",
    );
  }

  return findSystemSetting();
}
