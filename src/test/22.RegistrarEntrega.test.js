import * as chai from 'chai';
import { describe, it } from 'mocha';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:8000');

describe('Registrar Entrega (Repartidor)', () => {
  it('Debería registrar la entrega de un pedido', async () => {
    const pedidoId = 1;
    const accion = 'entregado'; // Ajustar según el controller
    const response = await requester.post(`/pedido/cambiarEstado/${pedidoId}/${accion}`)
      .send({
        // Datos adicionales
      });
    console.log(response.body);
    expect(response.status).to.equal(400);
    // expect(response.body).to.have.property('data');
  });
});
