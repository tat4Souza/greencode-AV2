import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { z } from "zod";

const SECRET_HASH =
  "$2b$10$7W/tJf.1eJvNuz741j5c5.ska5WCmpyBonFddc4k6GxAKzlrD6qAa";

async function easterEggRoutes(server: FastifyInstance) {
  server.post<{ Body: { password: string } }>(
    "/",
    {
      schema: {
        hide: true,
        body: z.object({ password: z.string().min(1) }),
      },
    },
    async (request, reply) => {
      const ok = await bcrypt.compare(request.body.password, SECRET_HASH);
      if (!ok) return reply.code(404).send({ message: "Not Found" });

      return reply.send({
        message:
          "DIN DIN DIN DIN! EasterEgg correto! :) | Desenvolvido por Taís Fernandes de Souza - Fatec 2DSM",
      });
    },
  );
}

export default easterEggRoutes;
