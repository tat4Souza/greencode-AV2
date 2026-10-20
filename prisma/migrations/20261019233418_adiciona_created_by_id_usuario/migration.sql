-- AlterTable
ALTER TABLE "usuario" ADD COLUMN     "us_criado_por" UUID,
ALTER COLUMN "us_papel" SET DEFAULT 'AUDITOR';

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_us_criado_por_fkey" FOREIGN KEY ("us_criado_por") REFERENCES "usuario"("us_cod") ON DELETE SET NULL ON UPDATE CASCADE;
