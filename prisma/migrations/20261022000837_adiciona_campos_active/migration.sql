-- DropForeignKey
ALTER TABLE "contrato" DROP CONSTRAINT "contrato_cont_org_cod_fkey";

-- DropForeignKey
ALTER TABLE "equipamento" DROP CONSTRAINT "equipamento_equi_lote_cod_fkey";

-- DropForeignKey
ALTER TABLE "lote" DROP CONSTRAINT "lote_lote_org_cod_fkey";

-- DropForeignKey
ALTER TABLE "movimentacao" DROP CONSTRAINT "movimentacao_mov_equi_cod_fkey";

-- AlterTable
ALTER TABLE "lote" ADD COLUMN     "lote_ativo" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "organizacao" ADD COLUMN     "org_ativo" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "usuario" ADD COLUMN     "us_ativo" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "contrato" ADD CONSTRAINT "contrato_cont_org_cod_fkey" FOREIGN KEY ("cont_org_cod") REFERENCES "organizacao"("org_cod") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lote" ADD CONSTRAINT "lote_lote_org_cod_fkey" FOREIGN KEY ("lote_org_cod") REFERENCES "organizacao"("org_cod") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipamento" ADD CONSTRAINT "equipamento_equi_lote_cod_fkey" FOREIGN KEY ("equi_lote_cod") REFERENCES "lote"("lote_cod") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacao" ADD CONSTRAINT "movimentacao_mov_equi_cod_fkey" FOREIGN KEY ("mov_equi_cod") REFERENCES "equipamento"("equi_cod") ON DELETE CASCADE ON UPDATE CASCADE;
