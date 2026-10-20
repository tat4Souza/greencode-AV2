import { z } from "zod";

export const idParamsSchema = z.object({
  id: z.uuid({ error: "Id inválido." }),
});

export type IdParamsSchema = z.infer<typeof idParamsSchema>;
