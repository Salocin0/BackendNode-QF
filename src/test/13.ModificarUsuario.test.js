import chai from 'chai';
import { describe, it } from 'mocha';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://127.0.0.1:8000');

describe('Modificar usuario', () => {

    it('Debería dar error al actualizar el consumidor', async () => {
        const user = {
          consumidorId: 1,
          nombreC: 'NuevoNombre',
        };

        const response = await requester
          .put(`/consumidor/${user.consumidorId}`)
          .send(user);

        expect(response.status).to.equal(500);

        expect(response.body).to.have.property('status', 'error');
        expect(response.body).to.have.property('msg', 'Ocurrió un error al actualizar el encargado :(');


      });

      it('Debería actualizar los datos del consumidor con éxito', async () => {
        const user = {
          consumidorId: 5,
          nombreC: 'NuevoNombre',
          apellidoC: 'NuevoApellido',
          dniC: '12345678',
          fechaNacimiento: '1990-01-01',
          provinciaC: 'NuevaProvincia',
          localidad: 'NuevaLocalidad',
          telefono: '1234567890',
        };

        const response = await requester
          .put(`/consumidor/${user.consumidorId}`)
          .send(user);

        expect(response.status).to.equal(200);

        expect(response.body).to.have.property('status', 'success');
        expect(response.body).to.have.property('msg', 'Encargado actualizado correctamente');
        expect(response.body).to.have.property('code', 200);


      });



});
