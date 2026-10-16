-- CreateEnum
CREATE TYPE "papel" AS ENUM ('ADMIN', 'OPERADOR', 'GESTOR', 'AUDITOR');

-- CreateTable
CREATE TABLE "usuario" (
    "us_cod" UUID NOT NULL,
    "us_nome" TEXT NOT NULL,
    "us_email" TEXT NOT NULL,
    "us_senha_hash" TEXT NOT NULL,
    "us_papel" "papel" NOT NULL DEFAULT 'OPERADOR',
    "us_criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "us_atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("us_cod")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_us_email_key" ON "usuario"("us_email");
