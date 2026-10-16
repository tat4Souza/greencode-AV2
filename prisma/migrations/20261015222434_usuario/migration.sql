/*
  Warnings:

  - The `us_papel` column on the `usuario` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "papel" AS ENUM ('ADMIN', 'OPERADOR', 'GESTOR', 'AUDITOR');

-- AlterTable
ALTER TABLE "usuario" DROP COLUMN "us_papel",
ADD COLUMN     "us_papel" "papel" NOT NULL DEFAULT 'OPERADOR';

-- DropEnum
DROP TYPE "Role";
