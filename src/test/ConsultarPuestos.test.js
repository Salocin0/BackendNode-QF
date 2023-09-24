import chai from 'chai';
import { describe, it } from 'mocha';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:8000');

describe('Obtener todos los puestos de comida', () => {
  it('Debería devolver una lista de puestos si existen', async () => {
    const consumidorId = 1; 
    const response = await requester
      .get('/puesto') 
      .set('consumidorid', consumidorId); 

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal('success');
    expect(response.body.data).to.be.an('array');
  });

  it('Debería manejar el caso en que no existen puestos', async () => {
    const consumidorId = 2; 
    const response = await requester
      .get('/puesto') 
      .set('consumidorid', consumidorId);

    expect(response.status).to.equal(404);
    expect(response.body.status).to.equal('Error');
    expect(response.body.msg).to.equal('puestos not found');
    expect(response.body.data).to.deep.equal({}); 
  });
});
