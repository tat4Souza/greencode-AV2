-- CHECK constraints


-- Locking otimista: a versão nunca é negativa
ALTER TABLE "usuario"               ADD CONSTRAINT "ck_usuario_versao"      CHECK ("us_versao_otimista"    >= 0);
ALTER TABLE "organizacao"           ADD CONSTRAINT "ck_organizacao_versao"  CHECK ("org_versao_otimista"   >= 0);
ALTER TABLE "contrato"              ADD CONSTRAINT "ck_contrato_versao"     CHECK ("cont_versao_otimista"  >= 0);
ALTER TABLE "lote"                  ADD CONSTRAINT "ck_lote_versao"         CHECK ("lote_versao_otimista"  >= 0);
ALTER TABLE "equipamento"           ADD CONSTRAINT "ck_equipamento_versao"  CHECK ("equi_versao_otimista"  >= 0);
ALTER TABLE "configuracoes_sistema" ADD CONSTRAINT "ck_config_versao"       CHECK ("param_versao_otimista" >= 0);

-- Contrato
ALTER TABLE "contrato" ADD CONSTRAINT "ck_contrato_vencimento_apos_assinatura"
  CHECK ("cont_data_vencimento" > "cont_data_assinatura");
ALTER TABLE "contrato" ADD CONSTRAINT "ck_contrato_valor_mensal"
  CHECK ("cont_valor_mensal" >= 0);

-- Equipamento
ALTER TABLE "equipamento" ADD CONSTRAINT "ck_equipamento_peso_positivo"
  CHECK ("equi_peso" > 0);
ALTER TABLE "equipamento" ADD CONSTRAINT "ck_equipamento_ano_fabricacao"
  CHECK ("equi_ano_fabricacao" >= 1970);
ALTER TABLE "equipamento" ADD CONSTRAINT "ck_equipamento_posicao_positiva"
  CHECK ("equi_posicao_lote" >= 1);

-- Configurações globais
ALTER TABLE "configuracoes_sistema" ADD CONSTRAINT "ck_config_aliquota"
  CHECK ("param_aliquota_imposto" BETWEEN 0 AND 100);
ALTER TABLE "configuracoes_sistema" ADD CONSTRAINT "ck_config_depreciacao"
  CHECK ("param_coef_depreciacao" > 0);


-- Lote inativo não pode ser alterado (só reativado)
CREATE OR REPLACE FUNCTION fn_lote_inativo_imutavel() RETURNS trigger AS $$
BEGIN
  IF OLD."lote_ativo" = false AND NEW."lote_ativo" = false THEN
    RAISE EXCEPTION 'Lote % está inativo e não pode ser alterado', OLD."lote_cod"
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_lote_inativo_imutavel
BEFORE UPDATE ON "lote"
FOR EACH ROW EXECUTE FUNCTION fn_lote_inativo_imutavel();


-- Equipamento de lote inativo não pode ser inserido/alterado
-- (DELETE fica liberado para o hard delete e o ON DELETE CASCADE)
CREATE OR REPLACE FUNCTION fn_equipamento_lote_ativo() RETURNS trigger AS $$
DECLARE
  v_ativo boolean;
BEGIN
  SELECT "lote_ativo" INTO v_ativo FROM "lote" WHERE "lote_cod" = NEW."equi_lote_cod";
  IF v_ativo IS NOT TRUE THEN
    RAISE EXCEPTION 'Lote % está inativo: equipamentos não podem ser inseridos ou alterados',
      NEW."equi_lote_cod" USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_equipamento_lote_ativo
BEFORE INSERT OR UPDATE ON "equipamento"
FOR EACH ROW EXECUTE FUNCTION fn_equipamento_lote_ativo();


-- Data de entrada do lote (não futura, no máximo 90 dias atrás)
-- Compara em UTC com 1 min de tolerância
CREATE OR REPLACE FUNCTION fn_lote_data_entrada() RETURNS trigger AS $$
DECLARE
  v_agora timestamp := (now() AT TIME ZONE 'UTC');
BEGIN
  IF TG_OP = 'INSERT' OR NEW."lote_data_entrada" IS DISTINCT FROM OLD."lote_data_entrada" THEN
    IF NEW."lote_data_entrada" > v_agora + interval '1 minute' THEN
      RAISE EXCEPTION 'Data de entrada do lote não pode ser futura'
        USING ERRCODE = 'check_violation';
    END IF;
    IF NEW."lote_data_entrada" < v_agora - interval '90 days' - interval '1 minute' THEN
      RAISE EXCEPTION 'Data de entrada do lote não pode ser anterior a 90 dias'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_lote_data_entrada
BEFORE INSERT OR UPDATE ON "lote"
FOR EACH ROW EXECUTE FUNCTION fn_lote_data_entrada();

-- Movimentação com queda >= 2 categorias exige justificativa
CREATE OR REPLACE FUNCTION fn_movimentacao_justificativa() RETURNS trigger AS $$
DECLARE
  v_ordem estado_fisico[] := enum_range(NULL::estado_fisico);
  v_queda int;
BEGIN
  IF NEW."mov_estado_fisico_anterior" IS NOT NULL
     AND NEW."mov_estado_fisico_novo" IS NOT NULL THEN
    v_queda := array_position(v_ordem, NEW."mov_estado_fisico_novo")
             - array_position(v_ordem, NEW."mov_estado_fisico_anterior");
    IF v_queda >= 2 AND COALESCE(btrim(NEW."mov_justificativa"), '') = '' THEN
      RAISE EXCEPTION 'Justificativa obrigatória quando o estado físico cai duas categorias ou mais'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_movimentacao_justificativa
BEFORE INSERT ON "movimentacao"
FOR EACH ROW EXECUTE FUNCTION fn_movimentacao_justificativa();

-- Histórico de movimentações é imutável (só INSERT e DELETE)
CREATE OR REPLACE FUNCTION fn_movimentacao_imutavel() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Movimentações são um histórico imutável e não podem ser alteradas'
    USING ERRCODE = 'check_violation';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_movimentacao_imutavel
BEFORE UPDATE ON "movimentacao"
FOR EACH ROW EXECUTE FUNCTION fn_movimentacao_imutavel();