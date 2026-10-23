import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import {
  type ContractFilter,
  type CreateOrgInput,
  type UpdateOrgInput,
} from "../schemas/organization.schema.js";

const publicOrganizationSelect = {
  id: true,
  name: true,
  cnpj: true,
  email: true,
  stateRegistration: true,
  phoneNumber: true,
  cep: true,
  publicPlace: true,
  number: true,
  complement: true,
  neighbourhood: true,
  city: true,
  uf: true,
  contract: {
    select: {
      id: true,
      signedAt: true,
      expiresAt: true,
      clauses: true,
      monthlyValue: true,
      autoRenewal: true,
      createdBy: { select: { id: true, username: true } },
      createdAt: true,
      updatedBy: { select: { id: true, username: true } },
      updatedAt: true,
      version: true,
    },
  },
  createdBy: { select: { id: true, username: true } },
  createdAt: true,
  updatedBy: { select: { id: true, username: true } },
  updatedAt: true,
  version: true,
  active: true,
} satisfies Prisma.OrganizationSelect;

export function createOrganization(
  data: CreateOrgInput & { createdById: string },
) {
  const { contract, ...orgData } = data;

  return prisma.organization.create({
    data: {
      ...orgData,
      ...(contract && {
        contract: {
          create: { ...contract, createdById: orgData.createdById },
        },
      }),
    },
    select: publicOrganizationSelect,
  });
}

export function findOrgById(id: string) {
  return prisma.organization.findUnique({
    where: { id },
    select: publicOrganizationSelect,
  });
}

function filterFindCommand(
  filter?: ContractFilter,
): Prisma.OrganizationWhereInput {
  const now = new Date();

  switch (filter) {
    case "WITHOUT":
      return { contract: { is: null } };
    case "WITH":
      return { contract: { isNot: null } };
    case "VALID":
      return { contract: { is: { expiresAt: { gt: now } } } };
    case "EXPIRED":
      return { contract: { is: { expiresAt: { lte: now } } } };
    default:
      return {};
  }
}

export function findOrgs(filters: {
  active: boolean;
  contract?: ContractFilter;
}) {
  return prisma.organization.findMany({
    where: { active: filters.active, ...filterFindCommand(filters.contract) },
    select: publicOrganizationSelect,
  });
}

export async function updateOrganization(
  id: string,
  version: number,
  data: Omit<UpdateOrgInput, "version">,
  updatedById: string,
) {
  const result = await prisma.organization.updateMany({
    where: { id, version },
    data: { ...data, version: { increment: 1 }, updatedById },
  });
  return result.count;
}

export async function deleteOrganization(id: string) {
  return prisma.organization.delete({
    where: { id },
    select: { id: true },
  });
}

export async function updateOrganizationActiveStatus(
  id: string,
  version: number,
  value: boolean,
  updatedById: string,
) {
  return prisma.$transaction(async (tx) => {
    const result = await tx.organization.updateMany({
      where: { id, version, active: !value },
      data: { active: value, version: { increment: 1 }, updatedById },
    });

    if (result.count === 0) return 0;

    await tx.batch.updateMany({
      where: { orgId: id, active: !value },
      data: { active: value, version: { increment: 1 }, updatedById },
    });

    return result.count;
  });
}
