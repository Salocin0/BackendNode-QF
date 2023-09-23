import chai from 'chai';
import { describe, it } from 'mocha';
import supertest from 'supertest';
import { initPassport } from '../config/passport.config.js';

const expect = chai.expect;
const requester = supertest('http://127.0.0.1:8000');

describe('Inicio de sesión de usuario', () => {
  before(() => {
    initPassport(); 
  });

  it('Debería iniciar sesión como consumidor', async () => {
    const loginCredentialsC = {
      correoElectronico: 'consumidor@consumidor.com',
      contraseña: 'consumidor',
    };

    const response = await requester
      .post('/login').send(loginCredentialsC);

    expect(response.status).to.equal(200);
});

it('Debería iniciar sesión como Repartidor"', async () => {
    const loginCredentialsR = {
      correoElectronico: 'repartidor@repartidor.com',
      contraseña: 'repartidor',
    };

    const response = await requester
      .post('/login').send(loginCredentialsR);

    expect(response.status).to.equal(200);

});

it('Debería iniciar sesión como Encargado"', async () => {
    const loginCredentialsR = {
      correoElectronico: 'encargado@encargado.com',
      contraseña: 'encargado',
    };

    const response = await requester
      .post('/login').send(loginCredentialsR);

    expect(response.status).to.equal(200);

});

it('Debería iniciar sesión como Productor"', async () => {
    const loginCredentialsP = {
      correoElectronico: 'productor@productor.com',
      contraseña: 'productor',
    };

    const response = await requester
      .post('/login').send(loginCredentialsP);

    expect(response.status).to.equal(200);

});

  it('No debera ingresar ya que son credenciales incorrectas', async () => {
    const invalidCredentials = {
      correoElectronico: 'correo-incorrecto@ejemplo.com',
      contraseña: 'contraseña-incorrecta',
    };

    const response = await requester
      .post('/login').send(invalidCredentials);

    expect(response.status).to.equal(302);

    expect(response.headers).to.have.property('location', '/login/faillogin');
  });
});
