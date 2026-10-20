import type { FastifyInstance } from "fastify";

async function batchRoutes(server: FastifyInstance) {
  //   Criar lote com a lista de equipamentos no body | Papeis: ADMIN, GESTOR -> Aqui é para usar $transaction
  //   server.post("/", registerBatchHandler);
  //
  //   Lista todos os lotes cadastrados | Filtros: orgId e status | Papeis: TODOS
  //   server.get('/', getAllBatchesHandler)
  //
  //   Devolve o lote com os equipamentos e o peso total calculado pela função | Papeis: TODOS
  //   server.get('/:id', getBatchByIdHandler)
  //
  //   Edita as informações do próprio lote (não as do equipamento), com version | Papeis: ADMIN, GESTOR
  //   server.put('/:id', updateBatchByIdHandler)
  //
  //   Muda o status, com version | Papeis: ADMIN, GESTOR
  //   server.patch('/:id/status', updateBatchStatusHandler)
  //
  //   ROTA DO EQUIPAMENTO
  //   server.post('/:id/equipments', registerEquipmentHandler) ADMIN, GESTOR
}

export default batchRoutes;
