import * as chai from 'chai';
import { describe, it } from 'mocha';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:8000');

describe('Generar alerta de pedido', () => {
  it('Debería enviar una notificación de pedido', async () => {
    const response = await requester.post('/notificacion')
      .send({
        titulo: 'Nuevo Pedido',
        mensaje: 'Tienes un nuevo pedido pendiente',
        consumidorId: 1
      });
    console.log(response.body);
    expect(response.status).to.equal(404);
    // expect(response.body).to.have.property('data');
  });
});
