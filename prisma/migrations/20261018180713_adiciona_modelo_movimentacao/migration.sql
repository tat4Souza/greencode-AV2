-- CreateTable
CREATE TABLE "movimentacao" (
    "mov_cod" UUID NOT NULL,
    "mov_equi_cod" UUID NOT NULL,
    "mov_origem" TEXT NOT NULL,
    "mov_destino" TEXT NOT NULL,
    "mov_status_anterior" "status_rastreamento",
    "mov_status_novo" "status_rastreamento" NOT NULL,
    "mov_estado_fisico_anterior" "estado_fisico",
    "mov_estado_fisico_novo" "estado_fisico",
    "mov_justificativa" TEXT,
    "mov_realizado_por" UUID NOT NULL,
    "mov_realizado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mov_observacao" TEXT,

    CONSTRAINT "movimentacao_pkey" PRIMARY KEY ("mov_cod")
);

-- CreateIndex
CREATE INDEX "movimentacao_mov_equi_cod_mov_realizado_em_idx" ON "movimentacao"("mov_equi_cod", "mov_realizado_em");

-- CreateIndex
CREATE INDEX "movimentacao_mov_realizado_por_idx" ON "movimentacao"("mov_realizado_por");

-- AddForeignKey
ALTER TABLE "movimentacao" ADD CONSTRAINT "movimentacao_mov_realizado_por_fkey" FOREIGN KEY ("mov_realizado_por") REFERENCES "usuario"("us_cod") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacao" ADD CONSTRAINT "movimentacao_mov_equi_cod_fkey" FOREIGN KEY ("mov_equi_cod") REFERENCES "equipamento"("equi_cod") ON DELETE RESTRICT ON UPDATE CASCADE;
