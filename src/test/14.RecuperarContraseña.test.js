import * as chai from 'chai';
import { describe, it } from 'mocha';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://127.0.0.1:8000');

describe('Recuperación de contraseña', () => {
  it('Debería enviar un correo de recuperación de contraseña', async () => {
    const email = 'consumidor@consumidor.com';

    const response = await requester
      .put('/user/recuperarcontrasenia')
      .send({ correoElectronico: email });

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal('success');
    // The recovery code is sent only by email, never in the response.
    expect(response.body.data).to.equal(null);

  });

  it('Debería manejar un usuario que no existe', async () => {
    const email = 'correoincorrecto@ejemplo.com';

    const response = await requester
      .put('/user/recuperarcontrasenia').send({ correoElectronico: email });

    expect(response.status).to.oneOf([400, 500]);
    expect(response.body.status).to.equal('error');
  });

  it('Debería rechazar un código de recuperación inventado', async () => {
    const response = await requester
      .put(`/user/recuperarcontrasenia/${'0'.repeat(64)}`)
      .send({ contraseña: '12345678' });

    expect(response.status).to.equal(400);
  });
});
