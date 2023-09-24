import chai from 'chai';
import { describe, it } from 'mocha';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:8000');

describe('Creación de Puestos de Comida', () => {
  it('Debería crear un puesto de comida con éxito', async () => {
    const formData = {
      nombreCarro: 'NombreCarroPrueba',
      numeroCarro: '999',
      tipoNegocio: 'TipoNegocioPrueba',
      telefonoCarro: '987654321',
      consumidorId: 1,
      banner: 'base64Banner',
      logo: 'base64Logo',
    };

    const response = await requester
      .post('/puesto')
      .send(formData);

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal('success');
  });

  it('Debería manejar un intento de crear un puesto con el mismo número de carro', async () => {
    const formData = {
      nombreCarro: 'NombreCarroPrueba',
      numeroCarro: '999',
      tipoNegocio: 'TipoNegocioPrueba',
      telefonoCarro: '987654321',
      consumidorId: 1,
      banner: 'base64Banner',
      logo: 'base64Logo',
    };

    const response = await requester
      .post('/puesto')
      .send(formData);

    expect(response.status).to.equal(400);
    expect(response.body.status).to.equal('error');
    expect(response.body.msg).to.equal('puesto used');
  });

});
