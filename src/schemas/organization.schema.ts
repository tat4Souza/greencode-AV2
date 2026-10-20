import { cnpj } from "cpf-cnpj-validator";
import { z } from "zod";

export const createOrgSchema = z.object({
  name: z.string().min(1, "Razão Social é obrigatória"),
  cnpj: z
    .string()
    .min(1, "CNPJ é obrigatório")
    .refine((val) => cnpj.isValid(val), { message: "CNPJ inválido" }),
  email: z.email({
    error: (issue) =>
      issue.input === undefined
        ? "Email é obrigatório"
        : "Precisa ser um email válido",
  }),
  stateRegistration: z.string().optional(),
  phoneNumber: z.string().min(1, "Telefone é obrigatório"),
  cep: z
    .string()
    .trim()
    .regex(/^\d{5}-?\d{3}$/, {
      message: "CEP inválido. Use o formato 00000-000",
    }),
  publicPlace: z.string().min(1, "Logradouro é obrigatório"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighbourhood: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  uf: z.enum(
    [
      "AC",
      "AL",
      "AP",
      "AM",
      "BA",
      "CE",
      "DF",
      "ES",
      "GO",
      "MA",
      "MT",
      "MS",
      "MG",
      "PA",
      "PB",
      "PR",
      "PE",
      "PI",
      "RJ",
      "RN",
      "RS",
      "RO",
      "RR",
      "SC",
      "SP",
      "SE",
      "TO",
    ],
    { error: "Não é uma UF válida" },
  ),
  contract: z
    .object({
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
    })
    .optional(),
});

export const orgResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  cnpj: z.string(),
  email: z.string(),
  stateRegistration: z.string().nullable(),
  phoneNumber: z.string(),
  cep: z.string(),
  publicPlace: z.string(),
  number: z.string(),
  complement: z.string().nullable(),
  neighbourhood: z.string(),
  city: z.string(),
  uf: z.string(),
  createdBy: z.object({ id: z.uuid(), username: z.string() }),
  createdAt: z.date(),
  updatedAt: z.date(),
  version: z.number().int(),
  contract: z
    .object({
      id: z.uuid(),
      signedAt: z.date(),
      expiresAt: z.date(),
      clauses: z.array(
        z.object({ title: z.string(), description: z.string() }),
      ),
      monthlyValue: z.coerce.number(),
      autoRenewal: z.boolean(),
      version: z.number().int(),
    })
    .nullable(),
});

export const updateOrgSchema = createOrgSchema
  .omit({ contract: true })
  .partial()
  .extend({ version: z.number().int().min(0) });

export type UpdateOrgInput = z.infer<typeof updateOrgSchema>;
export type CreateOrgInput = z.infer<typeof createOrgSchema>;
