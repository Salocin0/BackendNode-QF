import chai from 'chai';
import { describe, it } from 'mocha';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:8000');

describe('Eliminar un producto', () => {
  it('Debería eliminar un producto si existe', async () => {
    const productId = 1;
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
