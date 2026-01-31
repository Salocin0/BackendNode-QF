import * as chai from 'chai';
import { describe, it } from 'mocha';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:8000');

describe('Asociar Repartidor (Productor de evento)', () => {
  it('Debería asociar un repartidor a un evento', async () => {
    const eventoId = 1;
    const puestoId = 1;
    const consumidorId = 1;
    const response = await requester.post(`/asociacion/evento/${eventoId}/asociar/${puestoId}/${consumidorId}`)
      .send({
        // Datos adicionales si es necesario
      });
    console.log(response.body);
    expect(response.status).to.equal(500);
    expect(response.body).to.have.property('data');
  });
});
