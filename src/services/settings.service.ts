import { badRequest, conflict } from "../lib/errors.js";
import {
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
  if (Object.keys(input).length === 0) {
    throw badRequest("É necessário passar o conteúdo a ser editado");
  }

  const { version, ...changes } = input;

  const count = await updateSystemSettings({ ...changes }, version, userId);

  if (count === 0) {
    throw conflict(
      "Configurações Globais já foram alteradas por outro administrador. Recarregue os dados.",
    );
  }

  return await findSystemSetting();
}
