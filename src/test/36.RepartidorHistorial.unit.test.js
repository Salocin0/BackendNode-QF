import { expect } from 'chai';
import { estadosPedidosRepartidor } from '../util/pedidosRepartidor.js';
describe('Estados de pedidos del repartidor', () => {
  it('conserva los pedidos en camino y entregados en la consulta existente', () => {
    expect(estadosPedidosRepartidor()).to.deep.equal(['EnCamino', 'Entregado']);
    expect(estadosPedidosRepartidor(false)).to.deep.equal(['EnCamino', 'Entregado']);
  });
  it('incluye los pedidos valorados en el historial porque ya fueron entregados', () => {
    expect(estadosPedidosRepartidor(true)).to.deep.equal(['Entregado', 'Valorado']);
    expect(estadosPedidosRepartidor(true)).not.to.include('EnCamino');
  });
});
