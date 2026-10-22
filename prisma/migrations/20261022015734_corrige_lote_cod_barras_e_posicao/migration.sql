/*
  Warnings:

  - You are about to drop the column `equi_codigo_barras` on the `equipamento` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "equipamento_equi_codigo_barras_key";

-- AlterTable
ALTER TABLE "equipamento" DROP COLUMN "equi_codigo_barras",
ALTER COLUMN "equi_posicao_lote" SET DEFAULT 1;
