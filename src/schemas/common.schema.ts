import { z } from "zod";

export const idParamsSchema = z.object({
  id: z.uuid({ error: "Id inválido." }),
});

export const versionBodySchema = z.object({ version: z.number().int().min(0) });
export type VersionBody = z.infer<typeof versionBodySchema>;
export type IdParamsSchema = z.infer<typeof idParamsSchema>;
