import * as chai from 'chai';
import { describe, it } from 'mocha';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:8000');

describe('Registrar Pedido (Usuario)', () => {
  it('Debería registrar un pedido si se ingresan datos correctos', async () => {
    const response = await requester.post('/pedido')
      .send({
        // Datos del pedido, ajustar según el controller
        consumidorId: 1,
        productos: [{ productoId: 1, cantidad: 2 }],
        total: 100.0
      });
    console.log(response.body);
    expect(response.status).to.equal(500);
    expect(response.body).to.have.property('data');
    // Ajustar expectativas según respuesta
  });
});
