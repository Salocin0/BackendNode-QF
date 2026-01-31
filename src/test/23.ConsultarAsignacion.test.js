import * as chai from 'chai';
import { describe, it } from 'mocha';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:8000');

describe('Consultar Asignación (Repartidor)', () => {
  it('Debería obtener las asignaciones', async () => {
    const response = await requester.get('/asignacion');
    console.log(response.body);
    expect(response.status).to.equal(404);
    // expect(response.body).to.have.property('data');
  });
});
