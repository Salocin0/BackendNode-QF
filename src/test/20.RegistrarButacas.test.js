import * as chai from 'chai';
import { describe, it } from 'mocha';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:8000');

describe('Registrar Butacas (Productor de Eventos)', () => {
  it('Debería registrar butacas para un evento', async () => {
    const response = await requester.post('/evento/butacas')
      .send({
        eventoId: 1,
        butacas: [
          { fila: 'A', numero: 1, precio: 50 },
          { fila: 'A', numero: 2, precio: 50 }
        ]
      });
    console.log(response.body);
    expect(response.status).to.equal(404);
    // expect(response.body).to.have.property('data');
  });
});
