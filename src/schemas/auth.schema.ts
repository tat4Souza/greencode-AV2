import { z } from "zod";

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

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual"),
    newPassword: z.string({
      error: (issue) =>
        issue.input === undefined
          ? "Senha é obrigatório"
          : "Precisa ser uma string",
    }),
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "A nova senha deve ser diferente da atual",
    path: ["newPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export type LoginInput = z.infer<typeof loginSchema>;
