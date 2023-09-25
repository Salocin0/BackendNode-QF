import chai from 'chai';
import { describe, it } from 'mocha';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:8000');

describe('ascender de rol', () => {
  let usuarioRepartidor;
  let usuarioEncargado;
  let usuarioProductor;
  it('Ascender a repartidor', async () => {
    const response = await requester.post('/user').send({
      correoElectronico: 'ascrepartidor@consumidor.com',
      contraseña: 'repartidor',
      usuario: {
        contraseña: 'repartidor',
        fechaAlta: Date.now(),
        nombreDeUsuario: 'repartidorasc',
        correoElectronico: 'ascrepartidor@consumidor.com',
        tipoUsuario: 'consumidor',
      },
      consumidor: {
        nombre: 'nombreEjemplo',
        apellido: 'apellidoEjemplo',
        fechaDeNacimiento: Date.now(),
        dni: 11111111,
        localidad: 'localidad',
        provincia: 'provincia',
        telefono: 1111111121,
      },
    });
    usuarioRepartidor = response.body.data;
    const response2 = await requester.post(`/user/update/${usuarioRepartidor.consumidoreId}/to/repartidor`);

    expect(response2.body.data).to.have.property('tipoUsuario');
    expect(response2.body.data.tipoUsuario).to.equal('repartidor');
  });
  it('Ascender a productor', async () => {
    const response = await requester.post('/user').send({
      correoElectronico: 'ascproductor@consumidor.com',
      contraseña: 'productor',
      usuario: {
        contraseña: 'productor',
        fechaAlta: Date.now(),
        nombreDeUsuario: 'productorasc',
        correoElectronico: 'ascproductor@consumidor.com',
        tipoUsuario: 'consumidor',
      },
      consumidor: {
        nombre: 'nombreEjemplo',
        apellido: 'apellidoEjemplo',
        fechaDeNacimiento: Date.now(),
        dni: 11111111,
        localidad: 'localidad',
        provincia: 'provincia',
        telefono: 1111111121,
      },
    });
    usuarioProductor = response.body.data;
    const response2 = await requester.post(`/user/update/${usuarioProductor.consumidoreId}/to/productor`).send({
        cuit: 11111111111,
        razonSocial: 'pepe eventos',
        condicionIva: 'Monotributista',
    });

    expect(response2.body.data).to.have.property('tipoUsuario');
    expect(response2.body.data.tipoUsuario).to.equal('productor');
  });
  it('Ascender a encargado', async () => {
    const response = await requester.post('/user').send({
      correoElectronico: 'ascencargado@consumidor.com',
      contraseña: 'encargado',
      usuario: {
        contraseña: 'encargado',
        fechaAlta: Date.now(),
        nombreDeUsuario: 'encargadoasc',
        correoElectronico: 'ascencargado@consumidor.com',
        tipoUsuario: 'consumidor',
      },
      consumidor: {
        nombre: 'nombreEjemplo',
        apellido: 'apellidoEjemplo',
        fechaDeNacimiento: Date.now(),
        dni: 11111111,
        localidad: 'localidad',
        provincia: 'provincia',
        telefono: 1111111121,
      },
    });
    usuarioEncargado = response.body.data;
    const response2 = await requester.post(`/user/update/${usuarioEncargado.consumidoreId}/to/encargado`).send({
        cuit: 11111111111,
        razonSocial: 'pepe puestos',
        condicionIva: 'Monotributista',
    });

    expect(response2.body.data).to.have.property('tipoUsuario');
    expect(response2.body.data.tipoUsuario).to.equal('encargado');
  });
});
