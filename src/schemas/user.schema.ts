import { z } from "zod";

const userCore = {
  email: z.email({
    error: (issue) =>
      issue.input === undefined
        ? "Email é obrigatório"
        : "Precisa ser um email válido",
  }),
  username: z.string({
    error: (issue) =>
      issue.input === undefined
        ? "Nome de usuário é obrigatório"
        : "Precisa ser uma string",
  }),
  role: z.enum(["ADMIN", "OPERADOR", "GESTOR", "AUDITOR"], {
    error: (issue) =>
      issue.input === undefined
        ? "Papel do usuário é obrigatório"
        : "Precisa ser um dos tipos válidos: ADMIN, OPERADOR, GESTOR, AUDITOR",
  }),
};

export const createUserSchema = z.object({
  ...userCore,
  password: z.string({
    error: (issue) =>
      issue.input === undefined
        ? "Senha é obrigatório"
        : "Precisa ser uma string",
  }),
});

export const userResponse = z.object({
  id: z.uuid(),
  ...userCore,
  createdBy: z.object({ id: z.uuid(), username: z.string() }).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  version: z.number(),
});

export const updateUserSchema = createUserSchema
  .partial()
  .extend({ version: z.number().int().min(0) });

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export type CreateUserInput = z.infer<typeof createUserSchema>;
