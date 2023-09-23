import chai from 'chai';
import { describe, it } from 'mocha';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:8000');

describe('Actualizar un producto', () => {
  it('Debería actualizar un producto existente', async () => {
    const productoId = 1;
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
    expect(response.body.data).to.deep.equal(productoActualizado);
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
    expect(response.body.data).to.deep.equal({});
  });

 
});
