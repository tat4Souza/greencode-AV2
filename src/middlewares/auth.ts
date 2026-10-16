import type { FastifyReply, FastifyRequest } from "fastify";
import type { Role } from "../generated/prisma/enums.js";
import { forbidden, notAuth } from "../lib/errors.js";

export async function auth(request: FastifyRequest) {
  try {
    await request.jwtVerify();
  } catch {
    throw notAuth("Usuário não autenticado à plataforma");
  }
}

export function requireRole(...roles: Role[]) {
  return async (request: FastifyRequest) => {
    if (!roles.includes(request.user.role)) {
      throw forbidden("Você não tem permissão para essa operação");
    }
  };
}
