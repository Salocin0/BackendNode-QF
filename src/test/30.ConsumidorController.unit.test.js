import * as chai from 'chai';
import { describe, it, before, beforeEach, after } from 'mocha';

const expect = chai.expect;
process.env.DB_FORCE_SQLITE = 'true';

const makeRes = () => {
  const res = { statusCode: null, body: null };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    res.body = body;
    return res;
  };
  return res;
};

describe('PUT /consumidor/:id controller (stubbed service, no DB required)', () => {
  let consumidorController;
  let consumidorService;
  let originalGetOne;
  let originalUpdate;
  let updateArgs;

  before(async function () {
    this.timeout(120000);
    ({ consumidorController } = await import('../controllers/consumidor.controller.js'));
    ({ consumidorService } = await import('../services/consumidor.service.js'));
    originalGetOne = consumidorService.getOne;
    originalUpdate = consumidorService.updateOneNew;
  });

  beforeEach(() => {
    updateArgs = null;
    consumidorService.getOne = async () => ({ id: 4 });
    consumidorService.updateOneNew = async (id, data) => {
      updateArgs = { id, data };
      return { id, ...data };
    };
  });

  after(() => {
    consumidorService.getOne = originalGetOne;
    consumidorService.updateOneNew = originalUpdate;
  });

  const put = async (body) => {
    const res = makeRes();
    await consumidorController.updateOneController({ params: { id: '4' }, body }, res);
    return res;
  };

  it('400 for dd/mm/yyyy (ambiguous) and nothing is saved', async () => {
    const res = await put({ nombre: 'A', fechaNacimiento: '25/12/1995' });
    expect(res.statusCode).to.equal(400);
    expect(updateArgs).to.equal(null);
  });

  it('400 for mm/dd/yyyy as well', async () => {
    expect((await put({ fechaNacimiento: '12/25/1995' })).statusCode).to.equal(400);
  });

  it('200 for an ISO date, stored as the exact UTC instant, with the consumer message', async () => {
    const res = await put({ nombre: 'A', fechaNacimiento: '1995-01-01' });
    expect(res.statusCode).to.equal(200);
    expect(res.body.msg).to.equal('Consumidor actualizado correctamente');
    expect(updateArgs.data.fechaNacimiento.toISOString()).to.equal('1995-01-01T00:00:00.000Z');
  });

  it('200 when fechaNacimiento is not sent', async () => {
    expect((await put({ nombre: 'A' })).statusCode).to.equal(200);
  });
});
