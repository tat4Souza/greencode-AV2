import type { FastifyInstance } from "fastify";

async function equipmentsRoutes(server: FastifyInstance) {
  // Listar todos os equipamentos cadastrados | Filtros: batchId, status, type | Papeis: TODOS
  //   server.get('/', getAllEquipmentsHandler)
  //
  // Buscar um equipamento por id | Papeis: TODOS
  //   server.get('/:id', getEquipmentByIdHandler)
  //
  // Busca pelo código de barras interno | Papeis: TODOS
  //   server.get('/barcode/:code', getEquipmentByBarcodeHandler)
  //
  // Edita os dados de um equipamento | Papeis: ADMIN, GESTOR
  //   server.put('/:id', updateEquipmentByIdHandler)
}

export default equipmentsRoutes;
