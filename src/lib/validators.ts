import type { BatchStatus, TrackingStatus } from "../generated/prisma/enums.js";
import { findBatchById } from "../repositories/batch.repository.js";
import { badRequest, notFound } from "./errors.js";

export function assertValidEnteredAt(date?: Date) {
  if (!date) return;
  const limit = new Date();
  limit.setDate(limit.getDate() - 90);
  if (date > new Date())
    throw badRequest("Data de entrada não pode ser futura");
  if (date < limit)
    throw badRequest("Data de entrada não pode ser anterior a 90 dias");
}

export async function assertBatchStatusRules(
  equipments: { status: TrackingStatus }[],
  newStatus: BatchStatus,
) {
  switch (newStatus) {
    case "RECEBIDO":
      if (
        equipments.some(
          (eq) =>
            eq.status !== "AGUARDANDO_TRIAGEM" &&
            eq.status !== "EM_TRIAGEM" &&
            eq.status !== "AGUARDANDO_DESMONTE" &&
            eq.status !== "EM_DESMONTE",
        )
      ) {
        throw badRequest(
          "Não é possível retornar o lote para RECEBIDO se já houver equipamentos em estados finais",
        );
      }
      break;
    case "EM_TRIAGEM":
      if (equipments.some((eq) => eq.status === "AGUARDANDO_TRIAGEM")) {
        throw badRequest(
          "Não é possível colocar o lote em EM_TRIAGEM enquanto houver equipamentos aguardando triagem",
        );
      }
      break;
    case "TRIAGEM_CONCLUIDA":
      if (
        equipments.some(
          (eq) =>
            eq.status === "AGUARDANDO_TRIAGEM" || eq.status === "EM_TRIAGEM",
        )
      ) {
        throw badRequest(
          "Não é possível concluir a triagem do lote enquanto houver equipamentos em triagem ou aguardando",
        );
      }
      break;
    case "ENCAMINHADO":
      if (
        equipments.some(
          (eq) =>
            eq.status !== "AGUARDANDO_TRIAGEM" &&
            eq.status !== "EM_TRIAGEM" &&
            eq.status !== "AGUARDANDO_DESMONTE",
        )
      ) {
        throw badRequest(
          "Não é possível encaminhar lote enquanto houver equipamentos em triagem, aguardando triagem ou aguardando desmonte",
        );
      }
      break;
    case "FINALIZADO":
      if (
        equipments.some(
          (eq) =>
            eq.status === "AGUARDANDO_TRIAGEM" ||
            eq.status === "EM_TRIAGEM" ||
            eq.status === "AGUARDANDO_DESMONTE" ||
            eq.status === "EM_DESMONTE",
        )
      ) {
        throw badRequest(
          "Não é possível finalizar o lote enquanto houver equipamentos com pendências no processo.",
        );
      }
      break;

    default:
      throw badRequest("Status de lote não reconhecido");
  }
}
