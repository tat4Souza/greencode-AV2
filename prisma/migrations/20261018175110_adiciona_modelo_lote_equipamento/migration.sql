/*
  Warnings:

  - Added the required column `cont_valor_mensal` to the `contrato` table without a default value. This is not possible if the table is not empty.
  - Added the required column `org_bairro` to the `organizacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `org_cep` to the `organizacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `org_cidade` to the `organizacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `org_estado` to the `organizacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `org_logradouro` to the `organizacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `org_numero` to the `organizacao` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "status_rastreamento" AS ENUM ('AGUARDANDO_TRIAGEM', 'EM_TRIAGEM', 'AGUARDANDO_DESMONTE', 'EM_DESMONTE', 'PECAS_REAPROVEITADAS', 'MATERIAL_RECICLAVEL', 'DESCARTE_SEGURO', 'BAIXA_DEFINITIVA');

-- CreateEnum
CREATE TYPE "status_lote" AS ENUM ('RECEBIDO', 'EM_TRIAGEM', 'TRIAGEM_CONCLUIDA', 'ENCAMINHADO', 'FINALIZADO');

-- CreateEnum
CREATE TYPE "tipo_equipamento" AS ENUM ('COMPUTADOR_MESA', 'NOTEBOOK', 'MONITOR', 'IMPRESSORA', 'SERVIDOR', 'ROTEADOR', 'CABO_ESTRUTURADO', 'FONTE_ALIMENTACAO');

-- CreateEnum
CREATE TYPE "estado_fisico" AS ENUM ('NOVO', 'BOM_ESTADO', 'USADO_LEVE', 'USADO_MODERADO', 'DANIFICADO_LEVE', 'DANIFICADO_GRAVE', 'INSERVIVEL');

-- DropIndex
DROP INDEX "organizacao_org_email_key";

-- AlterTable
ALTER TABLE "contrato" ADD COLUMN     "cont_renovacao_automatica" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cont_valor_mensal" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "cont_versao_otimista" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "organizacao" ADD COLUMN     "org_bairro" TEXT NOT NULL,
ADD COLUMN     "org_cep" TEXT NOT NULL,
ADD COLUMN     "org_cidade" TEXT NOT NULL,
ADD COLUMN     "org_complemento" TEXT,
ADD COLUMN     "org_estado" CHAR(2) NOT NULL,
ADD COLUMN     "org_logradouro" TEXT NOT NULL,
ADD COLUMN     "org_numero" TEXT NOT NULL,
ADD COLUMN     "org_versao_otimista" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "org_insc_estadual" DROP NOT NULL;

-- AlterTable
ALTER TABLE "usuario" ADD COLUMN     "us_versao_otimista" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "us_papel" DROP DEFAULT;

-- CreateTable
CREATE TABLE "lote" (
    "lote_cod" UUID NOT NULL,
    "lote_org_cod" UUID NOT NULL,
    "lote_data_entrada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lote_nota_fiscal" TEXT NOT NULL,
    "lote_transportadora" TEXT NOT NULL,
    "lote_status" "status_lote" NOT NULL DEFAULT 'RECEBIDO',
    "lote_observacoes" TEXT,
    "lote_criado_por" UUID NOT NULL,
    "lote_criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lote_atualizado_em" TIMESTAMP(3) NOT NULL,
    "lote_versao_otimista" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "lote_pkey" PRIMARY KEY ("lote_cod")
);

-- CreateTable
CREATE TABLE "equipamento" (
    "equi_cod" UUID NOT NULL,
    "equi_lote_cod" UUID NOT NULL,
    "equi_codigo_barras" TEXT NOT NULL,
    "equi_tipo" "tipo_equipamento" NOT NULL,
    "equi_marca" TEXT NOT NULL,
    "equi_modelo" TEXT NOT NULL,
    "equi_ano_fabricacao" INTEGER NOT NULL,
    "equi_estado_fisico" "estado_fisico" NOT NULL,
    "equi_peso" DECIMAL(10,3) NOT NULL,
    "equi_posicao_lote" INTEGER NOT NULL,
    "equi_status" "status_rastreamento" NOT NULL DEFAULT 'AGUARDANDO_TRIAGEM',
    "equi_criado_por" UUID NOT NULL,
    "equi_criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "equi_atualizado_em" TIMESTAMP(3) NOT NULL,
    "equi_versao_otimista" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "equipamento_pkey" PRIMARY KEY ("equi_cod")
);

-- CreateIndex
CREATE INDEX "lote_lote_org_cod_idx" ON "lote"("lote_org_cod");

-- CreateIndex
CREATE INDEX "lote_lote_criado_por_idx" ON "lote"("lote_criado_por");

-- CreateIndex
CREATE UNIQUE INDEX "equipamento_equi_codigo_barras_key" ON "equipamento"("equi_codigo_barras");

-- CreateIndex
CREATE INDEX "equipamento_equi_criado_por_idx" ON "equipamento"("equi_criado_por");

-- CreateIndex
CREATE INDEX "equipamento_equi_lote_cod_idx" ON "equipamento"("equi_lote_cod");

-- CreateIndex
CREATE UNIQUE INDEX "equipamento_equi_lote_cod_equi_posicao_lote_key" ON "equipamento"("equi_lote_cod", "equi_posicao_lote");

-- CreateIndex
CREATE INDEX "organizacao_org_criado_por_idx" ON "organizacao"("org_criado_por");

-- AddForeignKey
ALTER TABLE "lote" ADD CONSTRAINT "lote_lote_org_cod_fkey" FOREIGN KEY ("lote_org_cod") REFERENCES "organizacao"("org_cod") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lote" ADD CONSTRAINT "lote_lote_criado_por_fkey" FOREIGN KEY ("lote_criado_por") REFERENCES "usuario"("us_cod") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipamento" ADD CONSTRAINT "equipamento_equi_criado_por_fkey" FOREIGN KEY ("equi_criado_por") REFERENCES "usuario"("us_cod") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipamento" ADD CONSTRAINT "equipamento_equi_lote_cod_fkey" FOREIGN KEY ("equi_lote_cod") REFERENCES "lote"("lote_cod") ON DELETE RESTRICT ON UPDATE CASCADE;
