/*
  Warnings:

  - The primary key for the `usuario` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `usuario` table. All the data in the column will be lost.
  - You are about to drop the column `papel` on the `usuario` table. All the data in the column will be lost.
  - The required column `us_cod` was added to the `usuario` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "usuario" DROP CONSTRAINT "usuario_pkey",
DROP COLUMN "id",
DROP COLUMN "papel",
ADD COLUMN     "us_cod" UUID NOT NULL,
ADD COLUMN     "us_papel" "Role" NOT NULL DEFAULT 'OPERADOR',
ADD CONSTRAINT "usuario_pkey" PRIMARY KEY ("us_cod");
