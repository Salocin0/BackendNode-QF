import { Pedido } from '../DAO/models/pedido.model.js';
import { DetallePedido } from '../DAO/models/detallePedido.model.js';
import { Puesto } from '../DAO/models/puesto.model.js';
import { Encargado } from '../DAO/models/encargado.model.js';
import { Consumidor } from '../DAO/models/consumidor.model.js';
import { Producto } from '../DAO/models/producto.model.js';

class PedidoService {
  async getAll(consumidorId) {
    const pedidos = await Pedido.findAll({
      where: {
        consumidorId: consumidorId,
      },
      include: [{ model: Puesto }, { model: DetallePedido, as: 'detalles' }],
    });
    return pedidos;
  }

  async getAllPuesto(consumidorId) {
    // Paso 1: Obtener el ID del encargado a través del consumidor
    const consumidor = await Consumidor.findOne({
      where: {
        id: consumidorId,
      },
    });

    const encargadoId = consumidor.encargadoId;

    // Paso 2: Obtener todos los puestos asociados al encargado
    const puestos = await Puesto.findAll({
      where: {
        encargadoId: encargadoId,
      },
      attributes: ['id'], // Solo necesitamos los IDs de los puestos
    });

    // Paso 3: Obtener todos los IDs de los puestos
    const idPuestos = puestos.map((puesto) => puesto.id);

    // Paso 4: Obtener todos los pedidos que tengan esos IDs de puesto
    const pedidos = await Pedido.findAll({
      where: {
        puestoid: idPuestos,
      },
      include: [
        {
          model: DetallePedido,
          as: 'detalles',
          include: [
            {
              model: Producto,
              as: 'producto',
            },
          ],
        },
        { model: Puesto },
      ],
    });

    console.log('Pedidos obtenidos:', pedidos);
    return pedidos;
  }
  catch(error) {
    console.error('Error al obtener pedidos por consumidor:', error);
    throw error;
  }

  async getOne(id) {
    const pedido = await Pedido.findOne({
      where: {
        id: id,
      },
      include: [{ model: Puesto }, { model: DetallePedido, as: 'detalles' }],
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
