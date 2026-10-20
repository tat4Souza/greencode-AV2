import { badRequest } from "./errors.js";

export function assertValidEnteredAt(date?: Date) {
  if (!date) return;
  const limit = new Date();
  limit.setDate(limit.getDate() - 90);
  if (date > new Date())
    throw badRequest("Data de entrada não pode ser futura");
  if (date < limit)
    throw badRequest("Data de entrada não pode ser anterior a 90 dias");
}

export function findDuplicates<T>(values: T[]): T[] {
  const seen = new Set<T>();
  const duplicated = new Set<T>();
  for (const v of values) {
    if (seen.has(v)) duplicated.add(v);
    seen.add(v);
  }
  return [...duplicated];
}
