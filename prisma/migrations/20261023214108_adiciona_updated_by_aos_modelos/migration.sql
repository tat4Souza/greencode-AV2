/*
  Warnings:

  - Added the required column `cont_atualizado_em` to the `contrato` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cont_criado_por` to the `contrato` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "contrato" ADD COLUMN     "cont_atualizado_em" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "cont_atualizado_por" UUID,
ADD COLUMN     "cont_criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "cont_criado_por" UUID NOT NULL;

-- AlterTable
ALTER TABLE "equipamento" ADD COLUMN     "equi_atualizado_por" UUID;

-- AlterTable
ALTER TABLE "lote" ADD COLUMN     "lote_atualizado_por" UUID;

-- AlterTable
ALTER TABLE "organizacao" ADD COLUMN     "org_atualizado_por" UUID;

-- AlterTable
ALTER TABLE "usuario" ADD COLUMN     "us_atualizado_por" UUID;

-- CreateIndex
CREATE INDEX "contrato_cont_criado_por_idx" ON "contrato"("cont_criado_por");

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_us_atualizado_por_fkey" FOREIGN KEY ("us_atualizado_por") REFERENCES "usuario"("us_cod") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizacao" ADD CONSTRAINT "organizacao_org_atualizado_por_fkey" FOREIGN KEY ("org_atualizado_por") REFERENCES "usuario"("us_cod") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrato" ADD CONSTRAINT "contrato_cont_criado_por_fkey" FOREIGN KEY ("cont_criado_por") REFERENCES "usuario"("us_cod") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrato" ADD CONSTRAINT "contrato_cont_atualizado_por_fkey" FOREIGN KEY ("cont_atualizado_por") REFERENCES "usuario"("us_cod") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lote" ADD CONSTRAINT "lote_lote_atualizado_por_fkey" FOREIGN KEY ("lote_atualizado_por") REFERENCES "usuario"("us_cod") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipamento" ADD CONSTRAINT "equipamento_equi_atualizado_por_fkey" FOREIGN KEY ("equi_atualizado_por") REFERENCES "usuario"("us_cod") ON DELETE SET NULL ON UPDATE CASCADE;
