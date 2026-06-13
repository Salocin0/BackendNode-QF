import { Pedido } from '../../DAO/models/pedido.model.js';

export const cancelarPedidosPendientes = async (eventoId) => {
  try {
    const [count] = await Pedido.update(
      { estado: 'Cancelado' },
      {
        where: {
          eventoId,
          estado: ['Pendiente', 'Precomprado', 'EnPreparacion', 'Confirmado'],
        },
      },
    );
    console.log(`Pedidos cancelados para evento ${eventoId}: ${count}`);
  } catch (error) {
    console.error(`Error al cancelar pedidos del evento ${eventoId}:`, error);
  }
};
