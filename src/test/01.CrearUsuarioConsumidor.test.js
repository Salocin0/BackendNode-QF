import chai from 'chai';
import { describe, it } from 'mocha';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:8000');

describe('Crear Usuario Consumidor', () => {
  it('Debería crear un usuario consumidor si se ingresan datos correctos', async () => {
    const response = await requester.post('/user')
      .send({
        correoElectronico: "consumidor@consumidor.com",
        contraseña: "consumidor",
        usuario: {
          contraseña: "consumidor",
          fechaAlta: Date.now(),
          nombreDeUsuario: "consumidor",
          correoElectronico: "consumidor@consumidor.com",
          tipoUsuario: "consumidor",
        },
        consumidor: {
          nombre: "nombreEjemplo",
          apellido: "apellidoEjemplo",
          fechaDeNacimiento: Date.now(),
          dni: 11111111,
          localidad: "localidad",
          provincia: "provincia",
          telefono: 1111111111,
        }
      });

    expect(response.status).to.equal(200);
    expect(response.body.data).to.have.property('email');
    expect(response.body.data.email).to.equal('consumidor@consumidor.com');
  });

  it('Debería manejar el caso en que el nombre de usuario ya exista', async () => {
    const response = await requester.post('/user')
    .send({
      correoElectronico: "consumidor2@consumidor.com",
      contraseña: "consumidor",
      usuario: {
        contraseña: "consumidor",
        fechaAlta: Date.now(),
        nombreDeUsuario: "consumidor",
        correoElectronico: "consumidor2@consumidor.com",
        tipoUsuario: "consumidor",
      },
      consumidor: {
        nombre: "nombreEjemplo",
        apellido: "apellidoEjemplo",
        fechaDeNacimiento: Date.now(),
        dni: 11111111,
        localidad: "localidad",
        provincia: "provincia",
        telefono: 1111111111,
      }
    });

    expect(response.status).to.equal(401);
  });

  it('Debería manejar el caso en que el email ya exista', async () => {
    const response = await requester.post('/user')
    .send({
      correoElectronico: "consumidor@consumidor.com",
      contraseña: "consumidor",
      usuario: {
        contraseña: "consumidor",
        fechaAlta: Date.now(),
        nombreDeUsuario: "consumidor2",
        correoElectronico: "consumidor@consumidor.com",
        tipoUsuario: "consumidor",
      },
      consumidor: {
        nombre: "nombreEjemplo",
        apellido: "apellidoEjemplo",
        fechaDeNacimiento: Date.now(),
        dni: 11111111,
        localidad: "localidad",
        provincia: "provincia",
        telefono: 1111111111,
      }
    });

    expect(response.status).to.equal(401);
  });
});

