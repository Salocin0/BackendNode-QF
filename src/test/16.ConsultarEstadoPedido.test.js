import * as chai from 'chai';
import { describe, it } from 'mocha';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:8000');

describe('Consultar Estado Pedido (Usuario)', () => {
  it('Debería obtener el estado de un pedido', async () => {
    const pedidoId = 1; // Ajustar ID existente
    const response = await requester.get(`/pedido/${pedidoId}`);
    console.log(response.body);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('data');
    // Ajustar expectativas
  });
});
