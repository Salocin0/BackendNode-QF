import * as chai from 'chai';
import { describe, it } from 'mocha';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:8000');

describe('Registrar Evento (Productor de Eventos)', () => {
  it('Debería registrar un evento si se ingresan datos correctos', async () => {
    const response = await requester.post('/evento')
      .send({
        nombre: 'Evento Ejemplo',
        descripcion: 'Descripción del evento',
        fecha: new Date(),
        productorId: 1
      });
    console.log(response.body);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('data');
  });
});
