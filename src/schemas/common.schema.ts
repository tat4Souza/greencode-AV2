import { z } from "zod";

export const idParamsSchema = z.object({
  id: z.uuid({ error: "Id inválido." }),
});

export const updateSettingsSchema = z.object({
  depreciationRate: z.coerce
    .number({ message: "A taxa de depreciação deve ser um número válido" })
    .positive({ message: "A taxa de depreciação deve ser um valor positivo" })
    .max(999.99, {
      message: "A taxa de depreciação não pode ultrapassar 999.99",
    })
    .refine((val) => Number(val.toFixed(2)) === val, {
      message: "A taxa de depreciação deve ter no máximo 2 casas decimais",
    }),

  taxRate: z.coerce
    .number({ message: "A alíquota de imposto deve ser um número válido" })
    .min(0, { message: "A alíquota não pode ser negativa" })
    .max(100, { message: "A alíquota máxima é de 100%" })
    .refine((val) => Number.isFinite(val) && Number(val.toFixed(2)) === val, {
      message: "A alíquota deve ter no máximo 2 casas decimais",
    }),
  version: z.number().int().min(0),
});

export const responseSettingsSchema = z.object({
  depreciationRate: z.coerce.number(),

  taxRate: z.coerce.number(),
  version: z.number(),
});

export const versionBodySchema = z.object({ version: z.number().int().min(0) });
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type VersionBody = z.infer<typeof versionBodySchema>;
export type IdParamsSchema = z.infer<typeof idParamsSchema>;
