import * as chai from 'chai';
import { describe, it, before } from 'mocha';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:8000');

// Uses a throwaway product instead of id=1: the demo seed puts the Choripán
// there, and renaming it left the chatbot without a menu to answer from.
describe('Actualizar un producto', () => {
  let productoId;

  before(async () => {
    const creado = await requester.post('/producto').send({
      nombre: `ProductoActualizar-${Date.now()}`,
      descripcion: 'Producto descartable para el test de actualización',
      imagen: 'imagenBase64',
      precio: 10.99,
      estado: true,
      aderezos: 'Aderezos',
      puestoId: 1,
    });
    productoId = creado.body?.data?.id;
  });

  it('Debería actualizar un producto existente', async () => {
    const productoActualizado = {
      nombre: 'Nuevo Nombre',
      descripcion: 'Nueva Descripción',
      stock: 10,
      img: 'nueva-imagen.jpg',
      precio: 15.99,
      estado: true,
    };

    const response = await requester
      .put(`/producto/${productoId}`)
      .send({ producto: productoActualizado });

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal('success');
    expect(response.body.msg).to.equal('producto is updated');
  });

  it('Debería manejar el caso en que el producto no existe', async () => {
    const productoIdNoExistente = 999;
    const productoActualizado = {
      nombre: 'Nuevo Nombre',
      descripcion: 'Nueva Descripción',
      stock: 10,
      img: 'nueva-imagen.jpg',
      precio: 15.99,
      estado: true,
    };

    const response = await requester
      .put(`/producto/${productoIdNoExistente}`)
      .send({ producto: productoActualizado });

    expect(response.status).to.equal(404);
    expect(response.body.status).to.equal('Error');
    expect(response.body.msg).to.equal('Producto not found');
  });

 
});
