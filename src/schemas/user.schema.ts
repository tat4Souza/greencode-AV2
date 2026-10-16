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

export const createUserResponseSchema = z.object({
  id: z.uuid(),
  ...userCore,
  createdAt: z.date(),
});

export const loginSchema = z.object({
  email: z.email({
    error: (issue) =>
      issue.input === undefined
        ? "Email é obrigatório"
        : "Precisa ser um email válido",
  }),
  password: z.string(),
});

export const loginResponseSchema = z.object({
  accessToken: z.string(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
