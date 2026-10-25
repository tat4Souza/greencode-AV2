-- DropIndex
DROP INDEX "configuracoes_sistema_param_atualizado_por_key";

-- AlterTable
ALTER TABLE "configuracoes_sistema" ALTER COLUMN "param_cod" SET DEFAULT '00000000-0000-0000-0000-000000000001';

DELETE FROM "configuracoes_sistema"
WHERE "param_cod" <> (
  SELECT "param_cod" FROM "configuracoes_sistema"
  ORDER BY "param_atualizado_em" DESC LIMIT 1
);

UPDATE "configuracoes_sistema"
SET "param_cod" = '00000000-0000-0000-0000-000000000001';

ALTER TABLE "configuracoes_sistema"
  ADD CONSTRAINT "ck_config_singleton"
  CHECK ("param_cod" = '00000000-0000-0000-0000-000000000001'::uuid);