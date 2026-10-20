import "dotenv/config";
import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";
import fjwt from "@fastify/jwt";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import userRoutes from "./routes/user.routes.js";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { auth } from "./middlewares/auth.js";
import authRoutes from "./routes/auth.routes.js";
import { Prisma } from "./generated/prisma/client.js";
import organizationRoutes from "./routes/organization.routes.js";
import batchRoutes from "./routes/batch.routes.js";
import equipmentsRoutes from "./routes/equipment.routes.js";

export const server = Fastify();

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("JWT_SECRET não definido no .env");
}

server.register(fjwt, {
  secret: jwtSecret,
});

server.get("/healthcheck", async function () {
  return { status: "OK" };
});

server.setErrorHandler((error, _request, reply) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return reply.code(404).send({ message: "Recurso não encontrado" });
    }
    if (error.code === "P2002") {
      const fields = (error.meta?.target as string[] | undefined)?.join(", ");
      return reply.code(409).send({
        message: `Valor já cadastrado${fields ? ` (${fields})` : ""}`,
      });
    }
  }

  return reply.send(error);
});

async function main() {
  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  await server.register(swagger, {
    openapi: {
      info: { title: "Greencode API", version: "1.0.0" },
      components: {
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        },
      },
    },
    transform: jsonSchemaTransform,
  });

  await server.register(swaggerUi, { routePrefix: "/docs" });

  server.register(authRoutes, { prefix: "api/auth" });
  server.register(async (authentiicated) => {
    authentiicated.addHook("onRequest", auth);

    authentiicated.register(userRoutes, { prefix: "api/users" });
    authentiicated.register(organizationRoutes, {
      prefix: "api/organizations",
    });
    authentiicated.register(batchRoutes, { prefix: "api/batches" });
    authentiicated.register(equipmentsRoutes, { prefix: "api/equipments" });
  });

  try {
    await server.listen({
      port: Number(process.env.PORT) || 3000,
      host: "0.0.0.0",
    });
    console.log(`Server pronto em http://localhost:3000`);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
