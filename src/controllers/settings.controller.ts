import type { FastifyReply, FastifyRequest } from "fastify";
import { getSettings, updateSettings } from "../services/settings.service.js";
import type { UpdateSettingsInput } from "../schemas/common.schema.js";

export async function getSettingsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const settings = await getSettings();

  return reply.send(settings);
}

export async function updateSettingsHandler(
  request: FastifyRequest<{ Body: UpdateSettingsInput }>,
  reply: FastifyReply,
) {
  const user = await updateSettings(request.body, request.user.id);

  return reply.send(user);
}
