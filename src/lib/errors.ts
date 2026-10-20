import { Prisma } from "../generated/prisma/client.js";

export type AppError = Error & { statusCode: number };

export function createError(message: string, statusCode = 400): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;

  return error;
}

export const notFound = (entity = "Recurso") =>
  createError(`${entity} não encontrado`, 404);

export const conflict = (message: string) => createError(message, 409);

export const forbidden = (message: string) => createError(message, 403);

export const notAuth = (message: string) => createError(message, 401);

export const badRequest = (message: string) => createError(message, 400);

export function isPrismaError(e: unknown, code: string) {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === code;
}
