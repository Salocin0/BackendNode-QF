import chai from 'chai';
import { describe, it } from 'mocha';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:8000');

describe('Obtener todos los productos', () => {
  it('Debería devolver una lista de productos si existen', async () => {
    const puestoId = 1;
    const response = await requester
      .get('/producto')
      .set('puestoid', puestoId);

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal('success');
    expect(response.body.data).to.be.an('array');
  });

  it('Debería manejar el caso en que no exista el puesto', async () => {
    const puestoId = 3;
    const response = await requester
      .get('/producto')
      .set('puestoid', puestoId);

    expect(response.status).to.equal(404);
    expect(response.body.status).to.equal('Error');
    expect(response.body.msg).to.equal('carrito not found');
    expect(response.body.data).to.deep.equal({});
  });
});
