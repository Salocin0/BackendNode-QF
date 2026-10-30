import * as chai from 'chai';
import { describe, it, before } from 'mocha';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:8000');

// Deletes a throwaway product instead of id=1: the demo seed puts the Choripán
// there, and deleting it left the chatbot without a menu to answer from.
describe('Eliminar un producto', () => {
  let productId;

  before(async () => {
    const creado = await requester.post('/producto').send({
      nombre: `ProductoEliminar-${Date.now()}`,
      descripcion: 'Producto descartable para el test de borrado',
      imagen: 'imagenBase64',
      precio: 9.99,
      estado: true,
      aderezos: 'Aderezos',
      puestoId: 1,
    });
    productId = creado.body?.data?.id;
  });

  it('Debería eliminar un producto si existe', async () => {
    const response = await requester
      .delete(`/producto/${productId}`) 

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal('success');
    expect(response.body.msg).to.equal('Producto deleted');
    expect(response.body.code).to.equal(200);
    expect(response.body.data).to.not.equal(null);
  });

  it('Debería manejar el caso en que el producto no existe', async () => {
    const productId = 9999;
    const response = await requester
      .delete(`/producto/${productId}`)

    expect(response.status).to.equal(404);
    expect(response.body.status).to.equal('Error');
    expect(response.body.msg).to.equal('Producto not found');

  });
});
