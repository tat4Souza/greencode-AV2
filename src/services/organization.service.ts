import {
  badRequest,
  conflict,
  isPrismaError,
  notFound,
} from "../lib/errors.js";
import {
  createOrganization,
  deactivateOrganization,
  deleteOrganization,
  findActiveOrgs,
  findOrgById,
  updateOrganization,
} from "../repositories/organization.repository.js";
import type {
  CreateOrgInput,
  UpdateOrgInput,
} from "../schemas/organization.schema.js";

export async function registerOrganization(
  input: CreateOrgInput,
  createdById: string,
) {
  try {
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

export async function getActiveOrgs() {
  return findActiveOrgs();
}

export async function updateOrgById(id: string, input: UpdateOrgInput) {
  const { version, ...changes } = input;

  if (Object.keys(changes).length === 0)
    throw badRequest("É necessário passar o conteúdo a ser editado");

  try {
    const count = await updateOrganization(id, version, changes);

    if (count === 0) {
      const exists = await findOrgById(id);
      if (!exists) throw notFound("Organização");
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

export async function deactivateOrgById(id: string, version: number) {
  const org = await findOrgById(id);
  if (!org) throw notFound("Organização");

  const count = await deactivateOrganization(id, version);
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
