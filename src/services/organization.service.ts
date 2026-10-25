import {
  badRequest,
  conflict,
  isPrismaError,
  notFound,
} from "../lib/errors.js";
import {
  createOrganization,
  deleteOrganization,
  findOrgById,
  findOrgs,
  updateOrganization,
  updateOrganizationActiveStatus,
} from "../repositories/organization.repository.js";
import type {
  ContractFilter,
  CreateOrgInput,
  UpdateOrgInput,
} from "../schemas/organization.schema.js";

export async function registerOrganization(
  input: CreateOrgInput,
  createdById: string,
) {
  try {
    if (input.contract?.expiresAt && input.contract.expiresAt <= new Date()) {
      throw badRequest("A data de vencimento do contrato deve ser futura");
    }

    return await createOrganization({ ...input, createdById });
  } catch (e) {
    if (isPrismaError(e, "P2002")) {
      throw conflict("CNPJ já cadastrado");
    }
    throw e;
  }
}

export async function getOrgById(id: string) {
  const organization = await findOrgById(id);

  if (!organization) throw notFound("Organização");

  return organization;
}

export async function getOrgs(
  active: boolean = true,
  contract?: ContractFilter,
) {
  return findOrgs({ active, contract });
}

export async function updateOrgById(
  id: string,
  input: UpdateOrgInput,
  updatedBy: string,
) {
  const { version, ...changes } = input;
  const curOrg = await findOrgById(id);
  if (!curOrg) throw notFound("Organização");

  if (!curOrg.active)
    throw badRequest("Não é possível atualizar uma organização inativa");

  if (Object.keys(changes).length === 0)
    throw badRequest("É necessário passar o conteúdo a ser editado");

  try {
    const count = await updateOrganization(id, version, changes, updatedBy);

    if (count === 0) {
      throw conflict(
        "Organização já foi alterada por outra pessoa. Recarregue os dados.",
      );
    }

    return await findOrgById(id);
  } catch (e) {
    if (isPrismaError(e, "P2002")) throw conflict("CNPJ já cadastrado");
    throw e;
  }
}

export async function deactivateOrgById(
  id: string,
  version: number,
  updatedBy: string,
) {
  const org = await findOrgById(id);
  if (!org) throw notFound("Organização");

  if (!org.active) throw badRequest("Esta organização já está inativa");

  const count = await updateOrganizationActiveStatus(
    id,
    version,
    false,
    updatedBy,
  );
  if (count === 0)
    throw conflict(
      "Organização foi alterada por outra pessoa. Recarregue os dados",
    );
}

export async function reactivateOrgById(
  id: string,
  version: number,
  updatedBy: string,
) {
  const org = await findOrgById(id);
  if (!org) throw notFound("Organização");

  if (org.active) throw badRequest("Esta organização já está ativa");

  const count = await updateOrganizationActiveStatus(
    id,
    version,
    true,
    updatedBy,
  );
  if (count === 0)
    throw conflict(
      "Organização foi alterada por outra pessoa. Recarregue os dados",
    );
}

export async function deleteOrgById(id: string) {
  try {
    await deleteOrganization(id);
  } catch (e) {
    if (isPrismaError(e, "P2025")) throw notFound("Organização");
    throw e;
  }
}
