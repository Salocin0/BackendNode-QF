import * as chai from 'chai';
import { describe, it } from 'mocha';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:8000');

describe('Consultar Entregas (Repartidor)', () => {
  it('Debería obtener las entregas del repartidor', async () => {
    const consumidorId = 1;
    const response = await requester.get(`/asociacion/buscarR/${consumidorId}`);
    console.log(response.body);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('data');
  });
});
