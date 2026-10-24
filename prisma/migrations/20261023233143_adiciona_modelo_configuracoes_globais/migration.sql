-- CreateTable
CREATE TABLE "configuracoes_sistema" (
    "param_cod" UUID NOT NULL,
    "param_aliquota_imposto" DECIMAL(5,2) NOT NULL,
    "param_coef_depreciacao" DECIMAL(5,2) NOT NULL,
    "param_atualizado_por" UUID NOT NULL,
    "param_atualizado_em" TIMESTAMP(3) NOT NULL,
    "param_versao_otimista" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "configuracoes_sistema_pkey" PRIMARY KEY ("param_cod")
);

-- CreateIndex
CREATE UNIQUE INDEX "configuracoes_sistema_param_atualizado_por_key" ON "configuracoes_sistema"("param_atualizado_por");

-- AddForeignKey
ALTER TABLE "configuracoes_sistema" ADD CONSTRAINT "configuracoes_sistema_param_atualizado_por_fkey" FOREIGN KEY ("param_atualizado_por") REFERENCES "usuario"("us_cod") ON DELETE RESTRICT ON UPDATE CASCADE;
