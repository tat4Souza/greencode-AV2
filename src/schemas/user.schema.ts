import { z } from "zod";
import { Role } from "../generated/prisma/enums.js";

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
  password: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? "Senha é obrigatório"
          : "Precisa ser uma string",
    })
    .min(3, "Precisa ter pelo menos 3 caracteres"),
});

export const userResponse = z.object({
  id: z.uuid(),
  ...userCore,
  createdBy: z.object({ id: z.uuid(), username: z.string() }).nullable(),
  createdAt: z.date(),
  updatedBy: z.object({ id: z.uuid(), username: z.string() }).nullable(),
  updatedAt: z.date().nullable(),
  version: z.number(),
  active: z.boolean(),
});

export const updateUserSchema = createUserSchema
  .partial()
  .omit({ password: true })
  .extend({ version: z.number().int().min(0) });

export const listUsersQuerySchema = z.object({
  role: z.enum(Role).optional(),
  active: z.stringbool().optional(),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
