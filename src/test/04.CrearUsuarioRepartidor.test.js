import chai from 'chai';
import { describe, it } from 'mocha';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:8000');

describe('Crear Usuario Repartidor', () => {
  it('Debería crear un usuario repartidor si se ingresan datos correctos', async () => {
    const response = await requester.post('/user').send({
      correoElectronico: 'repartidor@repartidor.com',
      contraseña: 'repartidor',
      usuario: {
        contraseña: 'repartidor',
        fechaAlta: Date.now(),
        nombreDeUsuario: 'repartidor',
        correoElectronico: 'repartidor@repartidor.com',
        tipoUsuario: 'repartidor',
      },
      consumidor: {
        nombre: 'nombreEjemplo',
        apellido: 'apellidoEjemplo',
        fechaDeNacimiento: Date.now(),
        dni: 11111111,
        localidad: 'localidad',
        provincia: 'provincia',
        telefono: 1111111111,
      },
      repartidor: {},
    });

    expect(response.status).to.equal(200);
    expect(response.body.data).to.have.property('email');
    expect(response.body.data.email).to.equal('repartidor@repartidor.com');
  });

});
