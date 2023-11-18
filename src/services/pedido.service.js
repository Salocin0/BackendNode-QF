import { Pedido } from '../DAO/models/pedido.model.js';
import { DetallePedido } from '../DAO/models/detallePedido.model.js';
import { Puesto } from '../DAO/models/puesto.model.js';

class PedidoService {
  async getAll(consumidorId) {
    const pedidos = await Pedido.findAll({
      where: {
        consumidorId: consumidorId,
      },
      include: [{ model: Puesto },{ model: DetallePedido,as: 'detalles', }],
      
    });
      return pedidos;

  }

  async getOne(id) {
    const pedido = await Pedido.findOne({
      where: {
        id: id,
      },
      include: [{ model: Puesto },{ model: DetallePedido,as: 'detalles' }],
    });

    return pedido;
  }

  async create(pedido, detallesPedido) {
    const pedidoCreado = await Pedido.create(pedido);

    for (const detallePedido of detallesPedido) {
      detallePedido.PedidoId = pedidoCreado.id;
      await DetallePedido.create(detallePedido);
    }
  }
}

export const pedidoService = new PedidoService();
