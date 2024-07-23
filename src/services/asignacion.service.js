import { Asignacion } from "../DAO/models/asignacion.model.js";

class AsignacionService {
  async create(estado, pedidoId, repartidorId) {
    console.log(estado,pedidoId,repartidorId)
    const asignacion = {
        estado: estado,
        PedidoId: pedidoId,
        repartidoreId: repartidorId,
      };
    const asignacionCreada = await Asignacion.create(asignacion)
    return asignacionCreada;
  }
}

export const asignacionService = new AsignacionService();
