import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { PEDIDOS_ULTIMO_PRIMERO } from '../util/ordenPedidos.js';

// pedido.service.js cannot be imported in isolation (circular import with
// notificaciones.service), so its list queries are checked at source level.
const servicio = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'services', 'pedido.service.js'),
  'utf8'
);

const cuerpoDe = (metodo) => {
  const inicio = servicio.indexOf(`async ${metodo}(`);
  expect(inicio, metodo).to.be.greaterThan(-1);
  const siguiente = servicio.indexOf('\n  async ', inicio + 1);
  return servicio.slice(inicio, siguiente === -1 ? undefined : siguiente);
};

describe('Listados de pedidos: el último pedido primero', () => {
  it('ordena por fecha descendente y desempata por id', () => {
    expect(PEDIDOS_ULTIMO_PRIMERO).to.deep.equal([['fecha', 'DESC'], ['id', 'DESC']]);
  });

  for (const metodo of ['getAll', 'getAllPuesto', 'getAllPedidosOnePuesto', 'getAllRepartidor']) {
    it(`${metodo} pide los pedidos del más nuevo al más viejo`, () => {
      expect(cuerpoDe(metodo)).to.include('order: PEDIDOS_ULTIMO_PRIMERO');
    });
  }
});
