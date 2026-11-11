import { expect } from 'chai';
import { estadosPedidosRepartidor } from '../util/pedidosRepartidor.js';
describe('Estados de pedidos del repartidor', () => {
  it('limita la lista activa a los pedidos en camino', () => {
    expect(estadosPedidosRepartidor()).to.deep.equal(['EnCamino']);
    expect(estadosPedidosRepartidor(false)).to.deep.equal(['EnCamino']);
  });
  it('incluye los pedidos valorados en el historial porque ya fueron entregados', () => {
    expect(estadosPedidosRepartidor(true)).to.deep.equal(['Entregado', 'Valorado']);
    expect(estadosPedidosRepartidor(true)).not.to.include('EnCamino');
  });
});
