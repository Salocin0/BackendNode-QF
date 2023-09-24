import chai from 'chai';
import { it } from 'mocha';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:8000');
describe('Registrar Producto', () => {
  it('Debería crear un producto con éxito', async () => {
    const formData = {
      nombre: 'PruebaProducto',
      descripcion: 'Descripción del producto de prueba',
      imagen: 'imagenBase64',
      precio: 10.99,
      estado: true,
      aderezos: 'Aderezos del producto de prueba',
      puestoId: 1,
    };

    const response = await requester.post('/producto').send(formData);

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal('success');
  });

  it('Debería manejar un intento de crear un producto con nombre duplicado', async () => {
    const formData = {
      nombre: 'PruebaProducto',
      descripcion: 'Descripción del producto de prueba',
      imagen: 'imagenBase64',
      precio: 12.99,
      estado: true,
      aderezos: 'Aderezos del producto de prueba',
      puestoId: 1,
    };

    const response = await requester.post('/producto').send(formData);

    expect(response.status).to.equal(400);
    expect(response.body.status).to.equal('error');
    expect(response.body.msg).to.equal('Producto used');
  });
});
