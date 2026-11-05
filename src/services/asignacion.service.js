import { Asignacion } from '../DAO/models/asignacion.model.js';
import { consumidorService } from './consumidor.service.js';
import { Pedido } from '../DAO/models/pedido.model.js';
import { Repartidor } from '../DAO/models/repartidor.model.js';
import { Consumidor } from '../DAO/models/consumidor.model.js';
import { Puesto } from '../DAO/models/puesto.model.js';
import { responder, AsignacionError } from './asignacion.core.js';

export { AsignacionError };

class AsignacionService {
  async create(estado, pedidoId, repartidorId) {
    const asignacion = {
      estado: estado,
      PedidoId: Number(pedidoId),
      repartidoreId: repartidorId,
    };
    const asignacionCreada = await Asignacion.create(asignacion);
    return asignacionCreada;
  }

  async getOne(consumidorId) {
    const consumidor = await consumidorService.getOne(consumidorId);
    const asignacion = await Asignacion.findOne({
      where: { repartidoreId: consumidor.repartidorId, estado: 'Pendiente' },
      order: [['createdAt', 'ASC']],
      include: [
        {
          model: Pedido,
          include: [{ model: Consumidor }, { model: Puesto }],
        },
        Repartidor,
      ],
    });

    return asignacion;
  }

  responder(id, nuevoEstado, consumidorId = null) {
    return responder({ Asignacion, getConsumidor: (cid) => consumidorService.getOne(cid) }, id, nuevoEstado, consumidorId);
  }

  async rechazar(id, consumidorId = null) {
    return this.responder(id, 'Rechazado', consumidorId);
  }

  async aceptar(id, consumidorId = null) {
    return this.responder(id, 'Aceptado', consumidorId);
  }
}

export const asignacionService = new AsignacionService();
