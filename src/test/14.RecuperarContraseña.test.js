import chai from 'chai';
import { describe, it } from 'mocha';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://127.0.0.1:8000');

describe('Recuperación de contraseña', () => {
  let recoveryCode = null;

  it('Debería enviar un correo de recuperación de contraseña', async () => {
    const email = 'consumidor@consumidor.com';

    const response = await requester
      .put('/user/recuperarcontrasenia')
      .send({ correoElectronico: email });

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal('success');
    recoveryCode = response.body.data;

  });

  it('Debería manejar un usuario que no existe', async () => {
    const email = 'correoincorrecto@ejemplo.com';

    const response = await requester
      .put('/user/recuperarcontrasenia').send({ correoElectronico: email });

    expect(response.status).to.oneOf([400, 500]);
    expect(response.body.status).to.equal('error');
  });

  it('Debería actualizar la contraseña con éxito', async () => {
    if (recoveryCode === null) {
      throw new Error('No se generó un código de recuperación válido en el primer test');
    }

    const newPassword = '12345678';

    const response = await requester
      .put(`/user/recuperarcontrasenia/${recoveryCode}`)
      .send({ contraseña: newPassword });

    expect(response.status).to.equal(200);

  });
});
