import chai from 'chai';
import { describe, it } from 'mocha';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:8000');

describe('Crear Usuario Productor', () => {
  it('Debería crear un usuario productor si se ingresan datos correctos', async () => {
    const response = await requester.post('/user').send({
      correoElectronico: 'productor@productor.com',
      contraseña: 'productor',
      usuario: {
        contraseña: 'productor',
        fechaAlta: Date.now(),
        nombreDeUsuario: 'productor',
        correoElectronico: 'productor@productor.com',
        tipoUsuario: 'productor',
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
      productor: {
        cuit: 11111111111,
        razonSocial: "pepe's evento's",
        condicionIva: 'Monotributista',
      },
    });
    
    expect(response.status).to.equal(200);
    expect(response.body.data).to.have.property('email');
    expect(response.body.data.email).to.equal('productor@productor.com');
  });

  it('Debería manejar el caso en que la razon social ya exista', async () => {
    const response = await requester.post('/user').send({
      correoElectronico: 'productor2@productor.com',
      contraseña: 'productor',
      usuario: {
        contraseña: 'productor',
        fechaAlta: Date.now(),
        nombreDeUsuario: 'productor2',
        correoElectronico: 'productor2@productor.com',
        tipoUsuario: 'productor',
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
      productor: {
        cuit: 11111111111,
        razonSocial: "pepe's evento's",
        condicionIva: 'Monotributista',
      },
    });

    expect(response.status).to.equal(401);
  });
});
