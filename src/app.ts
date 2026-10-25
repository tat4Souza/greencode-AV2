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
import { env } from "./lib/env.js";
import { prisma } from "./lib/prisma.js";
import { ZodError } from "zod";
import settingsRoute from "./routes/settings.routes.js";
import reportRoutes from "./routes/report.routes.js";

export const server = Fastify({ logger: true });

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.register(fjwt, {
  secret: env.JWT_SECRET,
});

server.addHook("onClose", async () => {
  await prisma.$disconnect();
});

server.get("/healthcheck", async function () {
  return { status: "OK" };
});

server.setErrorHandler((error, request, reply) => {
  if (error instanceof ZodError) {
    return reply.code(400).send({
      message: error.issues
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", "),
    });
  }

  if (hasStatusCode(error)) {
    return reply.code(error.statusCode).send({ message: error.message });
  }

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

    if (error.code === "P2003") {
      return reply.code(400).send({
        message:
          "Operação inválida: registro relacionado não encontrado ou em uso.",
      });
    }
  }

  request.log.error(error);

  return reply.code(500).send({
    message: "Erro interno do servidor",
  });
});

function hasStatusCode(
  error: unknown,
): error is { statusCode: number; message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof (error as any).statusCode === "number"
  );
}

let shuttingDown = false;

async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;

  server.log.info(`${signal} recebido, encerrando o servidor...`);

  const forceExit = setTimeout(() => {
    server.log.error("Tempo limite excedido, forçando encerramento");
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  try {
    await server.close();
    server.log.info("Servidor encerrado com sucesso");
    process.exit(0);
  } catch (e) {
    server.log.error(e, "Erro ao encerrar o servidor");
    process.exit(1);
  }
}

for (const signal of ["SIGINT", "SIGTERM", "SIGBREAK"] as const) {
  process.once(signal, () => void shutdown(signal));
}

async function main() {
  await server.register(swagger, {
    openapi: {
      info: { title: "Greencode API", version: "1.0.0" },
      components: {
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        },
      },
      security: [{ bearerAuth: [] }],
    },
    transform: jsonSchemaTransform,
  });

  await server.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: { persistAuthorization: true },
  });

  server.register(authRoutes, { prefix: "/api/auth" });

  server.register(async (authenticated) => {
    authenticated.addHook("onRequest", auth);

    authenticated.register(userRoutes, { prefix: "/api/users" });
    authenticated.register(organizationRoutes, {
      prefix: "/api/organizations",
    });
    authenticated.register(batchRoutes, { prefix: "/api/batches" });
    authenticated.register(equipmentsRoutes, { prefix: "/api/equipments" });
    authenticated.register(settingsRoute, { prefix: "/api/settings" });
    authenticated.register(reportRoutes, { prefix: "/api/reports" });
  });

  try {
    await server.listen({ port: env.PORT, host: env.HOST });
  } catch (e) {
    server.log.error(e);
    process.exit(1);
  }
}

main();
