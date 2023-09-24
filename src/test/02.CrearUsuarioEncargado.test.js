import chai from 'chai';
import { describe, it } from 'mocha';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:8000');

describe('Crear Usuario Encargado', () => {
  it('Debería crear un usuario encargado si se ingresan datos correctos', async () => {
    const response = await requester.post('/user').send({
      correoElectronico: 'encargado@encargado.com',
      contraseña: 'encargado',
      usuario: {
        contraseña: 'encargado',
        fechaAlta: Date.now(),
        nombreDeUsuario: 'encargado',
        correoElectronico: 'encargado@encargado.com',
        tipoUsuario: 'encargado',
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
      encargado: {
        cuit: 11111111111,
        razonSocial: "pepe's pancho's",
        condicionIva: 'Monotributista',
      },
    });

    expect(response.status).to.equal(200);
    expect(response.body.data).to.have.property('email');
    expect(response.body.data.email).to.equal('encargado@encargado.com');
  });

  it('Debería manejar el caso en que la razon social ya exista', async () => {
    const response = await requester.post('/user').send({
      correoElectronico: 'encargado2@encargado.com',
      contraseña: 'encargado',
      usuario: {
        contraseña: 'encargado',
        fechaAlta: Date.now(),
        nombreDeUsuario: 'encargado2',
        correoElectronico: 'encargado2@encargado.com',
        tipoUsuario: 'encargado',
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
      encargado: {
        cuit: 11111111111,
        razonSocial: "pepe's pancho's",
        condicionIva: 'Monotributista',
      },
    });

    expect(response.status).to.equal(401);
  });
});
