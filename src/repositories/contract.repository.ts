import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import type {
  CreateContractInput,
  UpdateContractInput,
} from "../schemas/contract.schema.js";

const publicContractSelect = {
  id: true,
  signedAt: true,
  expiresAt: true,
  clauses: true,
  monthlyValue: true,
  autoRenewal: true,
  version: true,
} satisfies Prisma.ContractSelect;

export function createContract(orgId: string, input: CreateContractInput) {
  return prisma.contract.create({
    data: { orgId, ...input },
    select: publicContractSelect,
  });
}

export function findContract(orgId: string) {
  return prisma.contract.findUnique({
    where: { orgId },
    select: publicContractSelect,
  });
}

export async function updateContract(
  orgId: string,
  version: number,
  data: Omit<UpdateContractInput, "version">,
) {
  const result = await prisma.contract.updateMany({
    where: { orgId, version },
    data: { ...data, version: { increment: 1 } },
  });
  return result.count;
}

export async function deleteContract(orgId: string) {
  return prisma.contract.delete({
    where: { orgId },
    select: { id: true },
  });
}
