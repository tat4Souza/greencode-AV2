import { z } from "zod";

export const contractSchema = z.object({
  expiresAt: z.coerce.date(),
  clauses: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
      }),
    )
    .min(1, "Informe ao menos uma cláusula"),
  monthlyValue: z.number().positive("Valor mensal deve ser maior que zero"),
  autoRenewal: z.boolean().optional(),
});

export const contractResponseSchema = z
  .object({
    id: z.uuid(),
    signedAt: z.date(),
    expiresAt: z.date(),
    clauses: z.array(z.object({ title: z.string(), description: z.string() })),
    monthlyValue: z.coerce.number(),
    autoRenewal: z.boolean(),
    createdBy: z.object({ id: z.uuid(), username: z.string() }).nullable(),
    createdAt: z.date(),
    updatedBy: z.object({ id: z.uuid(), username: z.string() }).nullable(),
    updatedAt: z.date().nullable(),
    version: z.number(),
  })
  .nullable();

export const updateContractSchema = contractSchema
  .partial()
  .extend({ version: z.number().int().min(0) });

export type UpdateContractInput = z.infer<typeof updateContractSchema>;
export type CreateContractInput = z.infer<typeof contractSchema>;
