-- CreateTable
CREATE TABLE "organizacao" (
    "org_cod" UUID NOT NULL,
    "org_razao_social" TEXT NOT NULL,
    "org_cnpj" TEXT NOT NULL,
    "org_insc_estadual" TEXT NOT NULL,
    "org_telefone" TEXT NOT NULL,
    "org_email" TEXT NOT NULL,
    "org_criado_por" UUID NOT NULL,
    "org_criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "org_atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizacao_pkey" PRIMARY KEY ("org_cod")
);

-- CreateTable
CREATE TABLE "contrato" (
    "cont_cod" UUID NOT NULL,
    "cont_org_cod" UUID NOT NULL,
    "cont_data_assinatura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cont_data_vencimento" TIMESTAMP(3) NOT NULL,
    "cont_clausulas" JSONB NOT NULL,

    CONSTRAINT "contrato_pkey" PRIMARY KEY ("cont_cod")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizacao_org_cnpj_key" ON "organizacao"("org_cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "organizacao_org_email_key" ON "organizacao"("org_email");

-- CreateIndex
CREATE UNIQUE INDEX "contrato_cont_org_cod_key" ON "contrato"("cont_org_cod");

-- AddForeignKey
ALTER TABLE "organizacao" ADD CONSTRAINT "organizacao_org_criado_por_fkey" FOREIGN KEY ("org_criado_por") REFERENCES "usuario"("us_cod") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrato" ADD CONSTRAINT "contrato_cont_org_cod_fkey" FOREIGN KEY ("cont_org_cod") REFERENCES "organizacao"("org_cod") ON DELETE RESTRICT ON UPDATE CASCADE;
