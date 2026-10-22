import "@fastify/jwt";
import type { Role } from "../generated/prisma/enums.js";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { id: string; role: Role; tv: number };
    user: { id: string; role: Role; tv: number };
  }
}
