import "dotenv/config";
import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";
import fjwt from "@fastify/jwt";
import userRoutes from "./routes/user.routes.js";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

export const server = Fastify();

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("JWT_SECRET não definido no .env");
}

server.register(fjwt, {
  secret: jwtSecret,
});

server.decorate(
  "auth",
  async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (e) {
      return reply.send(e);
    }
  },
);

server.get("/healthcheck", async function () {
  return { status: "OK" };
});

async function main() {
  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  server.register(userRoutes, { prefix: "api/users" });

  try {
    await server.listen({
      port: Number(process.env.PORT) || 3000,
      host: "0.0.0.0",
    });
    console.log(`Server ready at http://localhost:3000`);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
