import { Asignacion } from '../DAO/models/asignacion.model.js';
import { consumidorService } from './consumidor.service.js';
import { Pedido } from '../DAO/models/pedido.model.js';
import { Repartidor } from '../DAO/models/repartidor.model.js';
import { Consumidor } from '../DAO/models/consumidor.model.js';
import { Puesto } from '../DAO/models/puesto.model.js';

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
    console.log(consumidorId);
    const consumidor = await consumidorService.getOne(consumidorId);
    console.log(consumidor);
    const asignacion = await Asignacion.findOne({
      where: { repartidoreId: consumidor.repartidorId },
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

  async rechazar(Id) {
    const asignacion = await Asignacion.findOne({
      where: { id: Id },
    });
    asignacion.estado = 'Rechazado';
    asignacion.save()
  }

  async aceptar(Id) {
    const asignacion = await Asignacion.findOne({
      where: { id: Id },
    });
    asignacion.estado = 'Aceptado';
    asignacion.save()
  }
}

export const asignacionService = new AsignacionService();
