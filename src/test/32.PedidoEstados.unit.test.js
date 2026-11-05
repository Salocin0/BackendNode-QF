import * as chai from 'chai';
import { describe, it } from 'mocha';
import { estadosPedido } from '../estados/estados/estadosPedido.js';

const expect = chai.expect;

// Order lifecycle used by the encargado Kanban and the repartidor delivery screen:
// Pendiente -> Aceptado -> EnPreparacion -> EnCamino -> Entregado -> Valorado, with cancellation only before preparation.
const ACTIONS = ['crearPedido', 'tomarPedido', 'aceptar', 'preparar', 'enCamino', 'pedidoPreparado', 'pedidoEntregado', 'cancelar', 'asignar', 'valorar'];
const VALID = {
  Pendiente: { aceptar: 'Aceptado', cancelar: 'Cancelado' },
  Precomprado: { aceptar: 'Aceptado' },
  Aceptado: { preparar: 'EnPreparacion', cancelar: 'Cancelado' },
  EnPreparacion: { enCamino: 'EnCamino' },
  EnCamino: { pedidoEntregado: 'Entregado' },
  Entregado: { valorar: 'Valorado' },
  Cancelado: {},
  Valorado: {},
};

const makePedido = (estado) => {
  const pedido = { estado, saves: 0 };
  pedido.save = async () => { pedido.saves += 1; };
  return pedido;
};

describe('Pedido: máquina de estados', () => {
  for (const [estado, transitions] of Object.entries(VALID)) {
    describe(`desde ${estado}`, () => {
      for (const action of ACTIONS) {
        const target = transitions[action];
        if (target) {
          it(`${action} -> ${target} y persiste una vez`, async () => {
            const handler = estadosPedido[estado]?.[action];
            expect(handler, `falta ${estado}.${action}`).to.be.a('function');
            const pedido = makePedido(estado);
            await handler(pedido);
            expect(pedido.estado).to.equal(target);
            expect(pedido.saves).to.equal(1);
          });
        } else {
          it(`${action} está prohibido: no cambia el estado ni persiste`, async () => {
            const handler = estadosPedido[estado]?.[action];
            const pedido = makePedido(estado);
            if (handler) {
              let rejected = false;
              try {
                await handler(pedido);
              } catch (e) {
                rejected = true;
              }
              expect(rejected, `${estado}.${action} debería rechazarse`).to.equal(true);
            }
            expect(pedido.estado).to.equal(estado);
            expect(pedido.saves).to.equal(0);
          });
        }
      }
    });
  }

  it('el flujo completo de compra recorre todos los estados en orden', async () => {
    const pedido = makePedido('Pendiente');
    for (const action of ['aceptar', 'preparar', 'enCamino', 'pedidoEntregado', 'valorar']) {
      await estadosPedido[pedido.estado][action](pedido);
    }
    expect(pedido.estado).to.equal('Valorado');
    expect(pedido.saves).to.equal(5);
  });
});
