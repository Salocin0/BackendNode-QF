import * as chai from 'chai';
import { describe, it } from 'mocha';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:8000');

describe('Consultar evento (Productor de eventos)', () => {
  it('Debería obtener todos los eventos', async () => {
    const response = await requester.get('/evento');
    console.log(response.body);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('data');
  });
});
