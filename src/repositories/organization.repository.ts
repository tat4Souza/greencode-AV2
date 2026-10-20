import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import type {
  CreateOrgInput,
  UpdateOrgInput,
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
  createdAt: true,
  updatedAt: true,
  version: true,
  createdBy: { select: { id: true, username: true } },
  contract: {
    select: {
      id: true,
      signedAt: true,
      expiresAt: true,
      clauses: true,
      monthlyValue: true,
      autoRenewal: true,
      version: true,
    },
  },
} satisfies Prisma.OrganizationSelect;

export function createOrganization(
  data: CreateOrgInput & { createdById: string },
) {
  const { contract, ...orgData } = data;

  return prisma.organization.create({
    data: {
      ...orgData,
      ...(contract && { contract: { create: contract } }),
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

export function findActiveOrgs() {
  return prisma.organization.findMany({
    where: { contract: { expiresAt: { gt: new Date() } } },
    select: publicOrganizationSelect,
  });
}

export async function updateOrganization(
  id: string,
  version: number,
  data: Omit<UpdateOrgInput, "version">,
) {
  const result = await prisma.organization.updateMany({
    where: { id, version },
    data: { ...data, version: { increment: 1 } },
  });
  return result.count;
}
